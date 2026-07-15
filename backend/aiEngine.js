import { GoogleGenerativeAI } from "@google/generative-ai";
import { stadiumState } from "./stadiumState.js";
import dotenv from "dotenv";

dotenv.config();

// Attempt to load Google Gen AI
let aiClient = null;
let useGemini = false;

if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    useGemini = true;
    console.log("AI: Gemini API successfully initialized.");
  } catch (err) {
    console.warn("AI: Failed to initialize Gemini client, falling back to local smart engine.", err.message);
  }
} else {
  console.log("AI: No GEMINI_API_KEY found. Using high-fidelity local smart NLP engine.");
}

// Translations helper dictionary for offline mode
const LOCAL_TRANSLATIONS = {
  es: {
    greeting: "¡Hola! Soy tu Asistente ArenaIQ. ¿Cómo puedo ayudarte hoy en el Estadio MetLife?",
    fallback: "Disculpe, ¿podría reformular la pregunta? Puedo guiarle sobre accesos, transporte, baños, puertas, comida y reciclaje.",
    gate_status: "Estado de las Puertas del Estadio MetLife:",
    transit_info: "Información de transporte actual:",
    accessibility: "Rutas Accesibles: Contamos con ascensores en todas las secciones principales (Especialmente Sección 120 y 142). Las rampas están habilitadas en las puertas 1, 3 y 4.",
    reusable: "Al reciclar o usar transporte público ganas EcoPuntos y reduces la huella de carbono de la Copa Mundial 2026. ¡Gracias por participar!",
  },
  en: {
    greeting: "Hello! I am your ArenaIQ Assistant. How can I assist you at MetLife Stadium today?",
    fallback: "I didn't quite catch that. Try asking about entrance gates, concessions, restrooms, accessibility paths, transport, or recycling.",
    gate_status: "MetLife Stadium Gate Queue Status:",
    transit_info: "Current transit options and delays:",
    accessibility: "Accessibility Routing: Elevators are located at all main sections (primarily Section 120 and 142). Ramp access is fully operational at Gates 1, 3, and 4.",
    reusable: "Recycle items or take public transit to earn EcoPoints and decrease the carbon footprint of the World Cup 2026!",
  },
  pt: {
    greeting: "Olá! Sou o seu Assistente ArenaIQ. Como posso ajudar no MetLife Stadium hoje?",
    fallback: "Desculpe, não entendi bem. Posso ajudar com portões, banheiros, acessibilidade, transporte ou pontos de reciclagem.",
    gate_status: "Status dos Portões do MetLife Stadium:",
    transit_info: "Informações sobre transporte público:",
    accessibility: "Rotas de Acessibilidade: Elevadores nas seções principais (Seção 120 e 142). Acesso por rampa disponível nos Portões 1, 3 e 4.",
    reusable: "Recicle ou use transporte público para ganhar EcoPontos e ajudar na sustentabilidade da Copa 2026!",
  },
  ar: {
    greeting: "مرحباً! أنا مساعد ArenaIQ الذكي. كيف يمكنني مساعدتك في ملعب MetLife اليوم؟",
    fallback: "عذراً، لم أفهم سؤالك جيداً. يمكنك الاستفسار عن بوابات الدخول، الخدمات، ذوي الاحتياجات الخاصة، النقل أو إعادة التدوير.",
    gate_status: "حالة طوابير بوابات ملعب MetLife:",
    transit_info: "معلومات وسائل النقل والمواصلات:",
    accessibility: "مسارات ذوي الاحتياجات الخاصة: تتوفر المصاعد في الأقسام الرئيسية (خاصة القسم 120 و 142). الكراسي المتحركة متاحة عند البوابات 1 و 3 و 4.",
    reusable: "قم بإعادة التدوير أو استخدام النقل العام لربح نقاط EcoPoints والمساهمة في استدامة كأس العالم 2026!",
  }
};

/**
 * Clean user prompt to detect core intent and provide a contextual real-time response using stadiumState
 */
function localSmartResponse(prompt, lang = "en") {
  const query = prompt.toLowerCase();
  const translations = LOCAL_TRANSLATIONS[lang] || LOCAL_TRANSLATIONS["en"];

  // 1. Accessibility queries
  if (query.includes("wheelchair") || query.includes("accessibility") || query.includes("disabled") || query.includes("silla de ruedas") || query.includes("أصحاب الهمم") || query.includes("ramp") || query.includes("elevator")) {
    return `${translations.accessibility}\n\n- **Elevators**: Near Sections 101, 120, 142, and 205.\n- **Ramps**: North and South Entrances.\n- **Need Help?**: Please alert any volunteer wearing the bright green ArenaIQ armband.`;
  }

  // 2. Gate queue and waiting times
  if (query.includes("gate") || query.includes("entrance") || query.includes("queue") || query.includes("wait time") || query.includes("entrada") || query.includes("puerta") || query.includes("بوابة")) {
    let response = `${translations.gate_status}\n`;
    stadiumState.gates.forEach(g => {
      response += `- **${g.name} (${g.id})**: ${g.waitTime} min wait time | Status: *${g.status}* (Queue: approx ${g.lineLength} fans)\n`;
    });
    // Add dynamic advice
    const clearGate = stadiumState.gates.reduce((prev, curr) => prev.waitTime < curr.waitTime ? prev : curr);
    response += `\n💡 **AI Operations Recommendation**: We recommend entering through **${clearGate.name} (${clearGate.id})**, which has the shortest delay (${clearGate.waitTime} mins).`;
    return response;
  }

  // 3. Concession, food and drinks
  if (query.includes("food") || query.includes("drink") || query.includes("eat") || query.includes("beer") || query.includes("water") || query.includes("concession") || query.includes("tacos") || query.includes("comida") || query.includes("طعام")) {
    let response = `🍔 **MetLife Stadium Concession Telemetry (Real-Time):**\n\n`;
    stadiumState.concessions.forEach(c => {
      response += `- **${c.name}** (Zone ${c.zone}): ${c.waitTime} min wait | Popular Item: *${c.popularItem}* | Stock: ${c.stockStatus}\n`;
    });
    const lowWait = stadiumState.concessions.reduce((prev, curr) => prev.waitTime < curr.waitTime ? prev : curr);
    response += `\n💡 **AI Quick Tip**: If you are hungry, **${lowWait.name}** in Zone ${lowWait.zone} currently has the shortest queue (${lowWait.waitTime} mins).`;
    return response;
  }

  // 4. Transport, transit and departure
  if (query.includes("transit") || query.includes("train") || query.includes("bus") || query.includes("rideshare") || query.includes("uber") || query.includes("parking") || query.includes("transport") || query.includes("estacionamiento")) {
    let response = `🚆 **${translations.transit_info}**\n\n`;
    response += `- **NJ Transit Train**: ${stadiumState.transit.train.status} (${stadiumState.transit.train.waitTimeMins} mins wait, runs every ${stadiumState.transit.train.frequencyMins} mins).\n`;
    response += `- **NYC Shuttle Bus**: ${stadiumState.transit.bus.status} (${stadiumState.transit.bus.waitTimeMins} mins wait, runs every ${stadiumState.transit.bus.frequencyMins} mins).\n`;
    response += `- **Uber/Lyft (Lot G)**: ${stadiumState.transit.rideshare.status} | Average wait: ${stadiumState.transit.rideshare.averageWaitMins} mins | Surge: ${stadiumState.transit.rideshare.surgeMultiplier}x.\n`;
    response += `- **Parking gold/silver status**: Gold is ${stadiumState.transit.parking.GoldLot.status}, Silver is ${stadiumState.transit.parking.SilverLot.status}.\n`;
    response += `\n💡 **AI Ride Suggestion**: Public shuttle buses currently show normal service. We recommend the MetLife Shuttle over NJ Transit trains due to stadium crowd bottlenecks.`;
    return response;
  }

  // 5. Sustainability and green goals
  if (query.includes("recycle") || query.includes("sustainability") || query.includes("green") || query.includes("eco") || query.includes("carbon") || query.includes("points") || query.includes("sostenible")) {
    return `${translations.reusable}\n\n- **Stadium Carbon Level**: ${stadiumState.venue.stadiumCarbonEmissionKgs} kgs (Live Tracker)\n- **Recycling Bins**: Placed at the end of every seating aisle.\n- **Current Stats**: Total Recycled Plastic at MetLife matches today: **${stadiumState.sustainability.totalRecycledPlastic} items**!\n- **Eco-Action reward**: Open the 'Transit & Sustainability' tab in the app, log your recycling action, and claim **25 EcoPoints**!`;
  }

  // 6. Bathroom and Restrooms
  if (query.includes("bathroom") || query.includes("restroom") || query.includes("toilet") || query.includes("baño") || query.includes("wc") || query.includes("دورات مياه")) {
    return `🚻 **Restroom Telemetry:**\n- All main concourses have male, female, and gender-neutral family restrooms.\n- Restrooms in **Zone C** and **Zone D** currently have very low traffic.\n- Restrooms near Gate 2 are congested. We suggest using restrooms near sections 114 or 136 for minimal queues (under 2 minutes).`;
  }

  // 7. Match status and info
  if (query.includes("match") || query.includes("score") || query.includes("argentina") || query.includes("mexico") || query.includes("game") || query.includes("partido") || query.includes("copa")) {
    return `⚽ **FIFA World Cup 2026 Match Center:**\n- **Fixture**: Argentina vs Mexico\n- **Venue**: MetLife Stadium\n- **Status**: ${stadiumState.venue.status} (${stadiumState.venue.timeRemaining})\n- **Live Attendance**: ${stadiumState.venue.currentAttendance} fans (${Math.round((stadiumState.venue.currentAttendance / stadiumState.venue.capacity) * 100)}% capacity).`;
  }

  // Default fallback
  return translations.fallback;
}

/**
 * Main AI Query Handler
 * If Gemini API is available, calls Gemini injecting the live stadium telemetry.
 * Otherwise, falls back to the smart local response.
 */
export async function queryAI(prompt, lang = "en") {
  if (!useGemini) {
    return localSmartResponse(prompt, lang);
  }

  try {
    const model = aiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstructions = `
You are ArenaIQ, the official Generative AI Stadium Operations & Fan Assistant for the FIFA World Cup 2026 at MetLife Stadium.
Your goal is to provide helpful, polite, and extremely accurate advice to fans, venue staff, organizers, and volunteers.

Here is the current live stadium telemetry and operations state:
Match: ${stadiumState.venue.match}
Status: ${stadiumState.venue.status}
Remaining Time: ${stadiumState.venue.timeRemaining}
Current Attendance: ${stadiumState.venue.currentAttendance} / ${stadiumState.venue.capacity}
Active Stadium Alerts: ${stadiumState.venue.activeAlert || "None"}
Gates Queue wait times:
${stadiumState.gates.map(g => `- ${g.name} (${g.id}): Wait: ${g.waitTime}m, status: ${g.status}, length: ${g.lineLength}`).join("\n")}
Concession Queues:
${stadiumState.concessions.map(c => `- ${c.name} (Zone ${c.zone}): Wait: ${c.waitTime}m, Item: ${c.popularItem}, Stock: ${c.stockStatus}`).join("\n")}
Transit Status:
- NJ Transit Train: Wait: ${stadiumState.transit.train.waitTimeMins}m, Status: ${stadiumState.transit.train.status}
- NYC Shuttle Bus: Wait: ${stadiumState.transit.bus.waitTimeMins}m, Status: ${stadiumState.transit.bus.status}
- Uber/Lyft: Wait: ${stadiumState.transit.rideshare.averageWaitMins}m, Surge: ${stadiumState.transit.rideshare.surgeMultiplier}x, Status: ${stadiumState.transit.rideshare.status}
Active Safety & Operations Incidents:
${stadiumState.incidents.map(inc => `- ID: ${inc.id}, Location: ${inc.location}, Status: ${inc.status}, Title: ${inc.title}`).join("\n")}
Sustainability stats:
- Carbon emission level: ${stadiumState.venue.stadiumCarbonEmissionKgs} kgs
- Recycled plastic bottles: ${stadiumState.sustainability.totalRecycledPlastic} units

Instructions for responses:
1. Always formulate the answer in the requested language (language code: "${lang}"). If "${lang}" is "es", respond in fluent Spanish. If "ar", in Arabic. If "pt", in Portuguese. Otherwise, default to English.
2. Keep answers concise, clear, and actionable. Avoid rambling.
3. Integrate live stadium telemetry directly into your advice (e.g. if the user asks which gate is best, note the shortest wait times from Gates data).
4. If there's an incident or delay, suggest alternate routes or actions based on the state.
`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${systemInstructions}\n\nUser Question: ${prompt}` }] }]
    });

    return response.response.text();
  } catch (err) {
    console.error("AI: Gemini query failed, falling back to offline engine.", err.message);
    return localSmartResponse(prompt, lang);
  }
}

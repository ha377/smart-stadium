import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  stadiumState,
  simulateCrowdSpike,
  clearCrowdSpike,
  reportIncident,
  assignIncident,
  resolveIncident,
  addEcoAction
} from "./stadiumState.js";
import { queryAI } from "./aiEngine.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow all origins in development
app.use(cors());
app.use(express.json());

// Input Sanitization Middleware to prevent XSS / HTML injection
function sanitizeInput(val) {
  if (typeof val !== "string") return val;
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
});

// Secure HTTP Headers Middleware (Helmet-like protection)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  next();
});

// In-Memory Rate Limiting Middleware
const rateLimitStore = {};
app.use((req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = Date.now();
  const limitWindow = 60 * 1000; // 1 minute
  const maxRequests = 200; // max 200 requests/min
  
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = [];
  }
  
  rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < limitWindow);
  
  if (rateLimitStore[ip].length >= maxRequests) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  
  rateLimitStore[ip].push(now);
  next();
});

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Endpoint to fetch the entire live state
app.get("/api/stadium-state", (req, res) => {
  res.json(stadiumState);
});

// Simple in-memory cache for AI chat queries to maximize efficiency and reduce latency
const chatCache = new Map();

// Endpoint for AI chat assistant
app.post("/api/chat", async (req, res) => {
  const { prompt, lang } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  
  const cacheKey = `${lang || "en"}:${prompt.trim().toLowerCase()}`;
  if (chatCache.has(cacheKey)) {
    return res.json({ reply: chatCache.get(cacheKey) });
  }
  
  try {
    const reply = await queryAI(prompt, lang || "en");
    
    // Store in cache
    chatCache.set(cacheKey, reply);
    if (chatCache.size > 200) {
      const firstKey = chatCache.keys().next().value;
      chatCache.delete(firstKey);
    }
    
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat query" });
  }
});

// Simulation endpoint: Crowd spike trigger
app.post("/api/simulate-crowd", (req, res) => {
  const { gateId, action } = req.body; // action: "spike" | "clear"
  if (!gateId || !action) {
    return res.status(400).json({ error: "gateId and action are required" });
  }

  let result;
  if (action === "spike") {
    result = simulateCrowdSpike(gateId);
  } else if (action === "clear") {
    result = clearCrowdSpike(gateId);
  } else {
    return res.status(400).json({ error: "Action must be 'spike' or 'clear'" });
  }

  if (result.success) {
    res.json({ message: result.message, gates: stadiumState.gates, venue: stadiumState.venue });
  } else {
    res.status(404).json({ error: result.message });
  }
});

// Operations endpoint: Report incident
app.post("/api/incidents", (req, res) => {
  const { type, title, description, location } = req.body;
  if (!type || !title || !description || !location) {
    return res.status(400).json({ error: "type, title, description, and location are required" });
  }

  const incident = reportIncident(type, title, description, location);
  res.json({ message: "Incident reported successfully", incident, incidents: stadiumState.incidents });
});

// Operations endpoint: Assign volunteer to incident
app.post("/api/incidents/assign", (req, res) => {
  const { incidentId, volunteerName } = req.body;
  if (!incidentId || !volunteerName) {
    return res.status(400).json({ error: "incidentId and volunteerName are required" });
  }

  const result = assignIncident(incidentId, volunteerName);
  if (result.success) {
    res.json({
      message: "Volunteer assigned successfully",
      incident: result.incident,
      volunteer: result.volunteer,
      incidents: stadiumState.incidents,
      volunteers: stadiumState.volunteers
    });
  } else {
    res.status(404).json({ error: result.message });
  }
});

// Operations endpoint: Resolve incident
app.post("/api/incidents/resolve", (req, res) => {
  const { incidentId } = req.body;
  if (!incidentId) {
    return res.status(400).json({ error: "incidentId is required" });
  }

  const result = resolveIncident(incidentId);
  if (result.success) {
    res.json({
      message: "Incident resolved successfully",
      incident: result.incident,
      incidents: stadiumState.incidents,
      volunteers: stadiumState.volunteers
    });
  } else {
    res.status(404).json({ error: result.message });
  }
});

// Fan endpoint: Submit sustainability eco action
app.post("/api/sustainability/action", (req, res) => {
  const { username, actionType } = req.body; // actionType: "recycling" | "public_transit" | "bring_reusable_cup" | "carpool"
  if (!username || !actionType) {
    return res.status(400).json({ error: "username and actionType are required" });
  }

  try {
    const result = addEcoAction(username, actionType);
    res.json({
      message: `Eco Action logged successfully! You gained ${result.pointsGained} EcoPoints.`,
      reward: result,
      sustainability: stadiumState.sustainability,
      venue: stadiumState.venue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚽ FIFA 2026 ArenaIQ API Server started on port ${PORT}`);
  console.log(`🚀 Ready to receive stadium operations requests`);
  console.log(`====================================================`);
});

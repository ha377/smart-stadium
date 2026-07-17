/**
 * @fileoverview In-memory telemetry data store and operations logic simulating
 * a World Cup matchday (Argentina vs Mexico) at MetLife Stadium, East Rutherford, NJ.
 */

/**
 * @typedef {Object} VenueState
 * @property {string} name
 * @property {number} capacity
 * @property {number} currentAttendance
 * @property {string} match
 * @property {string} status
 * @property {string} timeRemaining
 * @property {number} sustainabilityScore
 * @property {number} stadiumCarbonEmissionKgs
 * @property {string|null} activeAlert
 */

/**
 * @typedef {Object} ZoneState
 * @property {string} name
 * @property {number} capacity
 * @property {number} current
 * @property {string} status
 * @property {boolean} accessibilityFriendly
 */

/**
 * @typedef {Object} GateState
 * @property {string} id
 * @property {string} name
 * @property {number} waitTime
 * @property {string} status
 * @property {number} lineLength
 */

/**
 * @typedef {Object} ConcessionState
 * @property {string} id
 * @property {string} name
 * @property {string} zone
 * @property {number} waitTime
 * @property {string} stockStatus
 * @property {string} popularItem
 */

/**
 * @typedef {Object} CarbonHistoryPoint
 * @property {string} time
 * @property {number} value
 */

/**
 * @typedef {Object} SustainabilityState
 * @property {number} totalRecycledPlastic
 * @property {number} totalEcoPointsAwarded
 * @property {CarbonHistoryPoint[]} carbonHistory
 * @property {Array<{rank: number, name: string, points: number}>} leaderboard
 */

/**
 * Live stadium telemetry and operations state.
 */
export const stadiumState = {
  venue: {
    name: "MetLife Stadium",
    capacity: 82500,
    currentAttendance: 79420,
    match: "Argentina vs Mexico",
    status: "Halftime",
    timeRemaining: "15' (Halftime)",
    sustainabilityScore: 88,
    stadiumCarbonEmissionKgs: 1240,
    activeAlert: null
  },

  /** @type {Object<string, ZoneState>} */
  zones: {
    A: { name: "Lower Bowl North", capacity: 15000, current: 14200, status: "High", accessibilityFriendly: true },
    B: { name: "Lower Bowl East", capacity: 18000, current: 17800, status: "Critical", accessibilityFriendly: true },
    C: { name: "Lower Bowl South", capacity: 15000, current: 11500, status: "Normal", accessibilityFriendly: true },
    D: { name: "Lower Bowl West", capacity: 18000, current: 16100, status: "High", accessibilityFriendly: true },
    E: { name: "Upper Level Outer", capacity: 16500, current: 19820, status: "Normal", accessibilityFriendly: false }
  },

  /** @type {GateState[]} */
  gates: [
    { id: "Gate 1", name: "Verizon Gate (North)", waitTime: 12, status: "Normal", lineLength: 45 },
    { id: "Gate 2", name: "Bud Light Gate (East)", waitTime: 40, status: "Crowded", lineLength: 210 },
    { id: "Gate 3", name: "Pepsi Gate (South)", waitTime: 5, status: "Clear", lineLength: 15 },
    { id: "Gate 4", name: "HCLTech Gate (West)", waitTime: 25, status: "Moderate", lineLength: 95 }
  ],

  /** @type {ConcessionState[]} */
  concessions: [
    { id: "C1", name: "Tacos & Burritos Plaza", zone: "B", waitTime: 22, stockStatus: "Optimal", popularItem: "Beef Barbacoa Tacos" },
    { id: "C2", name: "Bratwurst & Beers", zone: "A", waitTime: 15, stockStatus: "Optimal", popularItem: "Classic German Bratwurst" },
    { id: "C3", name: "Empanada Express", zone: "D", waitTime: 8, stockStatus: "Limited Stock", popularItem: "Spicy Beef Empanada" },
    { id: "C4", name: "Green & Clean Vegan Stand", zone: "C", waitTime: 3, stockStatus: "Optimal", popularItem: "Plant-based Hotdog" }
  ],

  transit: {
    train: { name: "NJ Transit Rail (Meadowlands Line)", frequencyMins: 10, waitTimeMins: 35, status: "Delayed due to platform crowd" },
    bus: { name: "MetLife Shuttle to NYC Port Authority", frequencyMins: 5, waitTimeMins: 15, status: "Normal Service" },
    rideshare: { name: "Uber/Lyft Designated Zone (Lot G)", averageWaitMins: 28, surgeMultiplier: 1.8, status: "High Demand" },
    parking: {
      GoldLot: { capacity: 5000, occupied: 4950, status: "Full" },
      SilverLot: { capacity: 8000, occupied: 7200, status: "90% Occupied" },
      ParkAndRide: { capacity: 12000, occupied: 4100, status: "Open" }
    }
  },

  incidents: [
    {
      id: "INC-302",
      type: "Facility",
      title: "Broken escalator between Level 1 and Level 2",
      description: "Escalator in Zone E (Outer Upper) stopped moving. High foot traffic density building up at nearby stairwell.",
      status: "Dispatched",
      location: "Zone E",
      time: "20:15",
      assignedVolunteer: "Carlos Santana",
      aiRecommendation: "Direct visitors to use the elevator in Section 120 or stairs in Section 124. Display dynamic rerouting alert on Screen 14."
    },
    {
      id: "INC-303",
      type: "Cleanup",
      title: "Spilled soda and food at Row 12, Block 104",
      description: "Sticky floor hazard reported by fan in Section 104. Slipping risk.",
      status: "Active",
      location: "Zone B - Section 104",
      time: "20:28",
      assignedVolunteer: null,
      aiRecommendation: "Deploy cleanup volunteer to Row 12 immediately. Estimated cleanup duration: 5 minutes."
    }
  ],

  volunteers: [
    { name: "Carlos Santana", location: "Zone E", status: "Busy (Escalator crowd control)", avatar: "👨‍🔧" },
    { name: "Fatima Al-Sayed", location: "Zone B", status: "Available", avatar: "👩‍⚕️" },
    { name: "John Doe", location: "Gate 1", status: "Available", avatar: "🙋‍♂️" },
    { name: "Yuki Tanaka", location: "Zone C", status: "Busy (Directing accessibility path)", avatar: "🙋‍♀️" }
  ],

  /** @type {SustainabilityState} */
  sustainability: {
    totalRecycledPlastic: 18450,
    totalEcoPointsAwarded: 92250,
    carbonHistory: [
      { time: "18:00", value: 1450 },
      { time: "18:30", value: 1400 },
      { time: "19:00", value: 1350 },
      { time: "19:30", value: 1300 },
      { time: "20:00", value: 1240 }
    ],
    leaderboard: [
      { rank: 1, name: "EcoFan_Leo", points: 450 },
      { rank: 2, name: "GreenMessi", points: 410 },
      { rank: 3, name: "CopaSustainability", points: 380 },
      { rank: 4, name: "ZeroWasteWorldCup", points: 320 }
    ]
  }
};

/**
 * Triggers a crowd surge simulation at a given gate.
 * @param {string} gateId - Unique identifier of the gate.
 * @returns {{success: boolean, message: string}}
 */
export function simulateCrowdSpike(gateId) {
  const gate = stadiumState.gates.find(g => g.id === gateId);
  if (gate) {
    gate.waitTime = 50;
    gate.status = "Critical";
    gate.lineLength = 280;
    stadiumState.venue.activeAlert = `Crowd surge detected at ${gate.name}! Rerouting systems active.`;
    return { success: true, message: `Simulated crowd spike at ${gate.id}` };
  }
  return { success: false, message: `Gate ${gateId} not found` };
}

/**
 * Clears an active crowd surge simulation.
 * @param {string} gateId - Unique identifier of the gate.
 * @returns {{success: boolean, message: string}}
 */
export function clearCrowdSpike(gateId) {
  const gate = stadiumState.gates.find(g => g.id === gateId);
  if (gate) {
    gate.waitTime = 10;
    gate.status = "Normal";
    gate.lineLength = 40;
    stadiumState.venue.activeAlert = null;
    return { success: true, message: `Cleared crowd spike at ${gate.id}` };
  }
  return { success: false, message: `Gate ${gateId} not found` };
}

/**
 * Logs a new safety or operations incident, with auto AI recommendations.
 * @param {string} type - Incident category (e.g. Medical, Security, Cleanup, Facility).
 * @param {string} title - Short description of the issue.
 * @param {string} description - Comprehensive details.
 * @param {string} location - Zone/section in the venue.
 * @returns {Object} The recorded incident object.
 */
export function reportIncident(type, title, description, location) {
  const id = `INC-${Math.floor(100 + Math.random() * 900)}`;
  const time = new Date().toTimeString().substring(0, 5);
  
  let aiRecommendation = "Deploy local volunteer team to investigate. Update zone status if density shifts.";
  const typeLower = type.toLowerCase();
  if (typeLower === "medical") {
    aiRecommendation = "Alert medical responders in Sector 108. Dispatch nearest stretcher team. Clear pathway in Corridor B.";
  } else if (typeLower === "security") {
    aiRecommendation = "Dispatch security officers immediately. Monitor security camera #C42. Keep exit route clear.";
  } else if (typeLower === "cleanup") {
    aiRecommendation = "Assign sanitation volunteer. Provide wet floor warning sign. Expected cleanup: 4 mins.";
  } else if (typeLower === "facility") {
    aiRecommendation = "Dispatch facility engineer. Redirect pedestrian queues to alternative facilities.";
  }

  const newIncident = {
    id,
    type,
    title,
    description,
    status: "Active",
    location,
    time,
    assignedVolunteer: null,
    aiRecommendation
  };

  stadiumState.incidents.unshift(newIncident);
  return newIncident;
}

/**
 * Assigns an available volunteer to an active incident.
 * @param {string} incidentId - Unique identifier of the incident.
 * @param {string} volunteerName - Name of the volunteer staff.
 * @returns {{success: boolean, message?: string, incident?: Object, volunteer?: Object}}
 */
export function assignIncident(incidentId, volunteerName) {
  const incident = stadiumState.incidents.find(inc => inc.id === incidentId);
  const volunteer = stadiumState.volunteers.find(v => v.name === volunteerName);
  
  if (incident && volunteer) {
    incident.status = "Dispatched";
    incident.assignedVolunteer = volunteerName;
    volunteer.status = `Busy (${incident.id})`;
    return { success: true, incident, volunteer };
  }
  return { success: false, message: "Incident or Volunteer not found" };
}

/**
 * Resolves an active incident, releasing the assigned volunteer.
 * @param {string} incidentId - Unique identifier of the incident.
 * @returns {{success: boolean, message?: string, incident?: Object}}
 */
export function resolveIncident(incidentId) {
  const incident = stadiumState.incidents.find(inc => inc.id === incidentId);
  if (incident) {
    incident.status = "Resolved";
    if (incident.assignedVolunteer) {
      const volunteer = stadiumState.volunteers.find(v => v.name === incident.assignedVolunteer);
      if (volunteer) {
        volunteer.status = "Available";
      }
    }
    return { success: true, incident };
  }
  return { success: false, message: "Incident not found" };
}

/**
 * Adds an eco-friendly contribution action for a fan, calculating points and carbon offset.
 * @param {string} username - Nickname of the fan logging the action.
 * @param {string} actionType - Category of sustainability action.
 * @returns {Object} The action results.
 */
export function addEcoAction(username, actionType) {
  let pointsGained = 10;
  let carbonOffset = 0.1;
  
  if (actionType === "recycling") {
    pointsGained = 25;
    carbonOffset = 0.5;
    stadiumState.sustainability.totalRecycledPlastic += 1;
  } else if (actionType === "public_transit") {
    pointsGained = 40;
    carbonOffset = 2.4;
  } else if (actionType === "bring_reusable_cup") {
    pointsGained = 15;
    carbonOffset = 0.3;
  } else if (actionType === "carpool") {
    pointsGained = 30;
    carbonOffset = 1.8;
  } else if (actionType === "bottle_refill") {
    pointsGained = 20;
    carbonOffset = 0.6;
  } else if (actionType === "waste_sorting") {
    pointsGained = 20;
    carbonOffset = 0.4;
  }

  stadiumState.sustainability.totalEcoPointsAwarded += pointsGained;
  stadiumState.venue.stadiumCarbonEmissionKgs = Math.max(100, stadiumState.venue.stadiumCarbonEmissionKgs - carbonOffset);

  // Add entry to carbonHistory
  const currentTime = new Date().toTimeString().substring(0, 5);
  stadiumState.sustainability.carbonHistory.push({
    time: currentTime,
    value: parseFloat(stadiumState.venue.stadiumCarbonEmissionKgs.toFixed(1))
  });
  if (stadiumState.sustainability.carbonHistory.length > 10) {
    stadiumState.sustainability.carbonHistory.shift();
  }

  // Update or insert into leaderboard
  let userRecord = stadiumState.sustainability.leaderboard.find(u => u.name === username);
  if (userRecord) {
    userRecord.points += pointsGained;
  } else {
    userRecord = {
      rank: stadiumState.sustainability.leaderboard.length + 1,
      name: username,
      points: pointsGained
    };
    stadiumState.sustainability.leaderboard.push(userRecord);
  }

  // Resort leaderboard
  stadiumState.sustainability.leaderboard.sort((a, b) => b.points - a.points);
  stadiumState.sustainability.leaderboard.forEach((user, idx) => {
    user.rank = idx + 1;
  });

  return { username, pointsGained, totalPoints: userRecord.points, carbonOffset };
}

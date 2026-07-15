// In-memory data store mimicking World Cup matchday telemetry at MetLife Stadium (East Rutherford, NJ)
// Pre-seeded with realistic data representing Argentina vs Mexico, FIFA World Cup 2026.

export const stadiumState = {
  venue: {
    name: "MetLife Stadium",
    capacity: 82500,
    currentAttendance: 79420,
    match: "Argentina vs Mexico",
    status: "Halftime",
    timeRemaining: "15' (Halftime)",
    sustainabilityScore: 88, // out of 100
    stadiumCarbonEmissionKgs: 1240, // live metric
    activeAlert: null
  },

  // Zones represent physical seating areas and corridors
  zones: {
    A: { name: "Lower Bowl North", capacity: 15000, current: 14200, status: "High", accessibilityFriendly: true },
    B: { name: "Lower Bowl East", capacity: 18000, current: 17800, status: "Critical", accessibilityFriendly: true },
    C: { name: "Lower Bowl South", capacity: 15000, current: 11500, status: "Normal", accessibilityFriendly: true },
    D: { name: "Lower Bowl West", capacity: 18000, current: 16100, status: "High", accessibilityFriendly: true },
    E: { name: "Upper Level Outer", capacity: 16500, current: 19820, status: "Normal", accessibilityFriendly: false }, // escalator bottleneck
  },

  // Entrance Gates and waiting lines
  gates: [
    { id: "Gate 1", name: "Verizon Gate (North)", waitTime: 12, status: "Normal", lineLength: 45 },
    { id: "Gate 2", name: "Bud Light Gate (East)", waitTime: 40, status: "Crowded", lineLength: 210 },
    { id: "Gate 3", name: "Pepsi Gate (South)", waitTime: 5, status: "Clear", lineLength: 15 },
    { id: "Gate 4", name: "HCLTech Gate (West)", waitTime: 25, status: "Moderate", lineLength: 95 }
  ],

  // Food, drinks & merchandise status
  concessions: [
    { id: "C1", name: "Tacos & Burritos Plaza", zone: "B", waitTime: 22, stockStatus: "Optimal", popularItem: "Beef Barbacoa Tacos" },
    { id: "C2", name: "Bratwurst & Beers", zone: "A", waitTime: 15, stockStatus: "Optimal", popularItem: "Classic German Bratwurst" },
    { id: "C3", name: "Empanada Express", zone: "D", waitTime: 8, stockStatus: "Limited Stock", popularItem: "Spicy Beef Empanada" },
    { id: "C4", name: "Green & Clean Vegan Stand", zone: "C", waitTime: 3, stockStatus: "Optimal", popularItem: "Plant-based Hotdog" }
  ],

  // Transport details & estimated departure delays
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

  // Safety & Operations Incidents (for staff dashboard)
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

  // List of active volunteer staff and their locations
  volunteers: [
    { name: "Carlos Santana", location: "Zone E", status: "Busy (Escalator crowd control)", avatar: "👨‍🔧" },
    { name: "Fatima Al-Sayed", location: "Zone B", status: "Available", avatar: "👩‍⚕️" },
    { name: "John Doe", location: "Gate 1", status: "Available", avatar: "🙋‍♂️" },
    { name: "Yuki Tanaka", location: "Zone C", status: "Busy (Directing accessibility path)", avatar: "🙋‍♀️" }
  ],

  // Eco actions completed by fans
  sustainability: {
    totalRecycledPlastic: 18450, // units
    totalEcoPointsAwarded: 92250,
    leaderboard: [
      { rank: 1, name: "EcoFan_Leo", points: 450 },
      { rank: 2, name: "GreenMessi", points: 410 },
      { rank: 3, name: "CopaSustainability", points: 380 },
      { rank: 4, name: "ZeroWasteWorldCup", points: 320 }
    ]
  }
};

// Simulation methods to alter the state dynamically based on client operations console triggers
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

export function reportIncident(type, title, description, location) {
  const id = `INC-${Math.floor(100 + Math.random() * 900)}`;
  const time = new Date().toTimeString().substring(0, 5);
  
  // AI Incident Recommendation engine (Simple Rule-based/NLP mapping)
  let aiRecommendation = "Deploy local volunteer team to investigate. Update zone status if density shifts.";
  if (type.toLowerCase() === "medical") {
    aiRecommendation = "Alert medical responders in Sector 108. Dispatch nearest stretcher team. Clear pathway in Corridor B.";
  } else if (type.toLowerCase() === "security") {
    aiRecommendation = "Dispatch security officers immediately. Monitor security camera #C42. Keep exit route clear.";
  } else if (type.toLowerCase() === "cleanup") {
    aiRecommendation = "Assign sanitation volunteer. Provide wet floor warning sign. Expected cleanup: 4 mins.";
  } else if (type.toLowerCase() === "facility") {
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

export function addEcoAction(username, actionType) {
  let pointsGained = 10;
  let carbonOffset = 0.1; // kgs offset per action
  
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
  }

  stadiumState.sustainability.totalEcoPointsAwarded += pointsGained;
  stadiumState.venue.stadiumCarbonEmissionKgs = Math.max(100, stadiumState.venue.stadiumCarbonEmissionKgs - carbonOffset);

  // Update or insert into leaderboard
  const userRecord = stadiumState.sustainability.leaderboard.find(u => u.name === username);
  if (userRecord) {
    userRecord.points += pointsGained;
  } else {
    stadiumState.sustainability.leaderboard.push({
      rank: stadiumState.sustainability.leaderboard.length + 1,
      name: username,
      points: pointsGained
    });
  }

  // Resort leaderboard
  stadiumState.sustainability.leaderboard.sort((a, b) => b.points - a.points);
  stadiumState.sustainability.leaderboard.forEach((user, idx) => {
    user.rank = idx + 1;
  });

  return { username, pointsGained, totalPoints: userRecord ? userRecord.points : pointsGained, carbonOffset };
}

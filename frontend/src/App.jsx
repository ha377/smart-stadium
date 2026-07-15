import React, { useState, useEffect } from "react";
import Map from "./components/Map";
import AiChat from "./components/AiChat";
import Operations from "./components/Operations";
import TransitSustainability from "./components/TransitSustainability";

const BACKEND_URL = "http://localhost:3001";

export default function App() {
  const [activeTab, setActiveTab] = useState("command");
  const [stadiumData, setStadiumData] = useState(null);
  
  // Selected visual helpers on map click
  const [selectedZone, setSelectedZone] = useState("B");
  const [selectedGate, setSelectedGate] = useState("Gate 2");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current stadium telemetry from API
  const fetchStadiumState = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stadium-state`);
      if (!response.ok) {
        throw new Error("Failed to load telemetry from backend.");
      }
      const data = await response.json();
      setStadiumData(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Cannot connect to ArenaIQ backend. Please ensure the backend server is running on port 3001.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStadiumState();
    
    // Poll telemetry every 8 seconds for pseudo real-time sync
    const interval = setInterval(fetchStadiumState, 8000);
    return () => clearInterval(interval);
  }, []);

  // API Call: Trigger crowd spike simulation
  const handleTriggerCrowdSpike = async (gateId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/simulate-crowd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateId, action: "spike" })
      });
      if (response.ok) {
        await fetchStadiumState();
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  // API Call: Clear crowd spike simulation
  const handleClearCrowdSpike = async (gateId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/simulate-crowd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateId, action: "clear" })
      });
      if (response.ok) {
        await fetchStadiumState();
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  // API Call: Report new incident
  const handleReportIncident = async (details) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
      });
      if (response.ok) {
        await fetchStadiumState();
      }
    } catch (err) {
      console.error("Incident reporting error:", err);
    }
  };

  // API Call: Assign volunteer to incident
  const handleAssignVolunteer = async (incidentId, volunteerName) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/incidents/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId, volunteerName })
      });
      if (response.ok) {
        await fetchStadiumState();
      }
    } catch (err) {
      console.error("Incident assignment error:", err);
    }
  };

  // API Call: Resolve incident
  const handleResolveIncident = async (incidentId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/incidents/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId })
      });
      if (response.ok) {
        await fetchStadiumState();
      }
    } catch (err) {
      console.error("Incident resolution error:", err);
    }
  };

  // API Call: Log eco contribution action
  const handleLogEcoAction = async (username, actionType) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/sustainability/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, actionType })
      });
      if (response.ok) {
        const result = await response.json();
        await fetchStadiumState();
        return result.reward;
      }
    } catch (err) {
      console.error("Sustainability logging error:", err);
    }
    return null;
  };

  // Click selectors for local detail box
  const selectZone = (zoneId) => {
    setSelectedZone(zoneId);
    setSelectedGate(null);
  };

  const selectGate = (gateId) => {
    setSelectedGate(gateId);
    setSelectedZone(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: "1rem" }}>
        <div className="pulse-dot green" style={{ width: "30px", height: "30px" }}></div>
        <div style={{ fontFamily: "Space Grotesk", fontSize: "1.2rem", fontWeight: 600 }}>Connecting to ArenaIQ Live Database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: "1.5rem", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>🚨</div>
        <div style={{ color: "var(--accent)", fontSize: "1.5rem", fontWeight: "bold" }}>Telemetry Connection Error</div>
        <div style={{ maxWidth: "500px", color: "var(--text-muted)", fontSize: "0.95rem" }}>{error}</div>
        <button onClick={fetchStadiumState} className="submit-btn" style={{ padding: "0.6rem 1.5rem" }}>
          Retry Server Handshake
        </button>
      </div>
    );
  }

  const { venue, gates, concessions, zones } = stadiumData;
  const currentGate = gates.find(g => g.id === selectedGate);
  const currentZone = zones[selectedZone];

  return (
    <div className="app-container">
      {/* Dynamic Alert Banner if active */}
      {venue.activeAlert && (
        <div style={{
          background: "linear-gradient(90deg, var(--accent) 0%, #aa0044 100%)",
          color: "#fff",
          textAlign: "center",
          padding: "0.5rem 1rem",
          fontWeight: 700,
          fontSize: "0.85rem",
          letterSpacing: "0.05em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5rem",
          boxShadow: "0 4px 20px rgba(255, 46, 147, 0.3)",
          zIndex: 101
        }}>
          <span>📢 EMERGENCY OPERATIONS: {venue.activeAlert}</span>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <span className="logo-icon">⚽</span>
          <div className="logo-title">
            <span>ArenaIQ 2026</span>
            <span className="logo-sub">FIFA Smart Stadium Command</span>
          </div>
        </div>

        {/* Live Match Info Ticker */}
        <div className="live-match-ticker">
          <span className="pulse-dot green"></span>
          <div className="ticker-text">
            <span>LIVE | {venue.match} ({venue.status})</span>
            <span style={{ color: "var(--primary)" }}>Attendance: {venue.currentAttendance.toLocaleString()}</span>
          </div>
        </div>

        {/* Header Tabs */}
        <nav className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === "command" ? "active" : ""}`}
            onClick={() => setActiveTab("command")}
          >
            📊 Operations Desk
          </button>
          <button 
            className={`tab-btn ${activeTab === "assistant" ? "active" : ""}`}
            onClick={() => setActiveTab("assistant")}
          >
            🤖 AI Fan Assistant
          </button>
          <button 
            className={`tab-btn ${activeTab === "green" ? "active" : ""}`}
            onClick={() => setActiveTab("green")}
          >
            🌱 Transit & Sustainability
          </button>
        </nav>
      </header>

      {/* Main Dashboard Layout */}
      <main className="dashboard-grid">
        
        {/* Left Side: Current Tab Content */}
        <section className="main-content">
          {activeTab === "command" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="glass-panel" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                
                {/* SVG Stadium Map */}
                <Map 
                  stadiumData={stadiumData}
                  onSelectZone={selectZone}
                  selectedZone={selectedZone}
                  onSelectGate={selectGate}
                  selectedGate={selectedGate}
                />

                {/* Local Inspector Box */}
                <div style={{ padding: "1.5rem", borderLeft: "1px solid var(--border-color)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ marginBottom: "1rem", color: "var(--secondary)" }}>🔍 Stadium Node Inspector</h3>
                    
                    {currentZone && (
                      <div>
                        <h4 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Zone {selectedZone}: {currentZone.name}</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                          <div>Status: <span className={`gate-status-pill ${currentZone.status === "Normal" ? "status-normal" : currentZone.status === "High" ? "status-moderate" : "status-critical"}`} style={{ display: "inline-block" }}>{currentZone.status}</span></div>
                          <div>Capacity Load: <strong>{currentZone.current.toLocaleString()} / {currentZone.capacity.toLocaleString()} ({Math.round(currentZone.current / currentZone.capacity * 100)}%)</strong></div>
                          <div>Accessibility Friendly Path: <strong>{currentZone.accessibilityFriendly ? "Yes (Elevator + Ramp access)" : "No (Stairwells only - Use Elevator Section 120)"}</strong></div>
                        </div>
                        
                        <div className="ai-recommendation-box" style={{ marginTop: "1.5rem" }}>
                          <strong>🧠 Zone AI Recommendation:</strong>
                          <p style={{ marginTop: "0.25rem", fontStyle: "italic" }}>
                            {currentZone.status === "Critical" 
                              ? "⚠️ Escalator load spike in Zone E. Dispatching volunteer staff to direct guests to elevators near Section 120." 
                              : "Traffic flow normal. Recommend concession stands in this zone to nearby fans."}
                          </p>
                        </div>
                      </div>
                    )}

                    {currentGate && (
                      <div>
                        <h4 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{currentGate.id}: {currentGate.name}</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                          <div>Status: <span className={`gate-status-pill ${currentGate.status === "Normal" ? "status-normal" : currentGate.status === "Moderate" ? "status-moderate" : "status-critical"}`} style={{ display: "inline-block" }}>{currentGate.status}</span></div>
                          <div>Queue Wait Time: <strong>{currentGate.waitTime} minutes</strong></div>
                          <div>Current Line: <strong>~{currentGate.lineLength} visitors</strong></div>
                        </div>

                        <div className="ai-recommendation-box" style={{ marginTop: "1.5rem" }}>
                          <strong>🧠 Gate AI Recommendation:</strong>
                          <p style={{ marginTop: "0.25rem", fontStyle: "italic" }}>
                            {currentGate.waitTime > 30 
                              ? `⚠️ High congestion at ${currentGate.id}. Dynamic display board has been instructed to redirect incoming ticket-holders to Pepsi Gate (Gate 3).` 
                              : "Flow within optimal bounds. No manual override required."}
                          </p>
                        </div>
                      </div>
                    )}

                    {!currentZone && !currentGate && (
                      <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                        Click on any stadium quadrant or gate circle on the SVG map to analyze dynamic local telemetry.
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "1rem" }}>
                    💡 Live state updates are pushed from sensors every 8 seconds.
                  </div>
                </div>
              </div>

              {/* Incidents & Simulation */}
              <Operations 
                stadiumData={stadiumData}
                onTriggerCrowdSpike={handleTriggerCrowdSpike}
                onClearCrowdSpike={handleClearCrowdSpike}
                onReportIncident={handleReportIncident}
                onAssignVolunteer={handleAssignVolunteer}
                onResolveIncident={handleResolveIncident}
              />
            </div>
          )}

          {activeTab === "assistant" && (
            <AiChat backendUrl={BACKEND_URL} />
          )}

          {activeTab === "green" && (
            <TransitSustainability 
              stadiumData={stadiumData}
              onLogEcoAction={handleLogEcoAction}
            />
          )}
        </section>

        {/* Right Side: Operations Quick Overview Telemetry Panel */}
        <section className="sidebar-content">
          
          {/* Gate Overview Telemetry */}
          <div className="glass-panel telemetry-card">
            <div className="card-header-styled">
              <h3 className="card-title-styled">🚪 Entrance Telemetry</h3>
            </div>
            {gates.map((g) => (
              <div key={g.id} className="gate-item" onClick={() => selectGate(g.id)} style={{ cursor: "pointer" }}>
                <div className="gate-info">
                  <span className="gate-name">{g.id} - {g.name.split(" ")[0]}</span>
                  <span className="gate-sub">Wait: {g.waitTime} mins</span>
                </div>
                <span className={`gate-status-pill ${
                  g.status === "Normal" || g.status === "Clear" 
                    ? "status-normal" 
                    : g.status === "Moderate" 
                    ? "status-moderate" 
                    : "status-critical"
                }`}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>

          {/* Concession Stand telemetry */}
          <div className="glass-panel telemetry-card">
            <div className="card-header-styled">
              <h3 className="card-title-styled">🍔 Concessions Stock & Queues</h3>
            </div>
            {concessions.map((c) => (
              <div key={c.id} className="gate-item">
                <div className="gate-info">
                  <span className="gate-name">{c.name}</span>
                  <span className="gate-sub">Zone {c.zone} | Wait: {c.waitTime} mins</span>
                </div>
                <span className={`gate-status-pill ${
                  c.stockStatus === "Optimal" ? "status-normal" : "status-critical"
                }`} style={{ fontSize: "0.75rem" }}>
                  {c.stockStatus}
                </span>
              </div>
            ))}
          </div>
          
        </section>

      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: "center", 
        padding: "1.5rem", 
        borderTop: "1px solid var(--border-color)", 
        color: "var(--text-muted)", 
        fontSize: "0.85rem",
        background: "rgba(13, 17, 27, 0.8)",
        marginTop: "auto"
      }}>
        © 2026 FIFA World Cup Smart Operations | Developed for Hack2Skill Smart Stadium Challenge
      </footer>
    </div>
  );
}

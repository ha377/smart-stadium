import React, { useState } from "react";

export default function Operations({ 
  stadiumData, 
  onTriggerCrowdSpike, 
  onClearCrowdSpike, 
  onReportIncident, 
  onAssignVolunteer, 
  onResolveIncident 
}) {
  const [formType, setFormType] = useState("Cleanup");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLoc, setFormLoc] = useState("Zone B");

  // State to hold selected volunteer per incident
  const [selectedVolunteer, setSelectedVolunteer] = useState({});

  if (!stadiumData) return <div style={{ color: "var(--text-muted)" }}>Loading operations data...</div>;

  const { incidents, volunteers, gates } = stadiumData;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) {
      alert("Please fill in all incident details.");
      return;
    }
    onReportIncident({
      type: formType,
      title: formTitle,
      description: formDesc,
      location: formLoc
    });
    // Reset form
    setFormTitle("");
    setFormDesc("");
  };

  const handleVolunteerSelect = (incidentId, name) => {
    setSelectedVolunteer(prev => ({
      ...prev,
      [incidentId]: name
    }));
  };

  const handleAssign = (incidentId) => {
    const volName = selectedVolunteer[incidentId];
    if (!volName) {
      alert("Please select an available volunteer first.");
      return;
    }
    onAssignVolunteer(incidentId, volName);
  };

  // Check if a gate has high load
  const isGateSpiked = (gateId) => {
    const gate = gates.find(g => g.id === gateId);
    return gate ? gate.status === "Critical" : false;
  };

  return (
    <div className="incident-grid">
      {/* Left Column: Command & Simulation Controls + Reporting */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* State Simulation Controls */}
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div className="card-header-styled">
            <h3 className="card-title-styled">🕹️ Telemetry Simulation Panel</h3>
          </div>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Trigger matchday emergencies or crowd issues. Observe how the ArenaIQ AI Assistant and Map instantly adapt.
          </p>
          <div className="simulator-panel">
            {/* Gate 2 crowd spike toggle */}
            {!isGateSpiked("Gate 2") ? (
              <button 
                className="sim-btn" 
                onClick={() => onTriggerCrowdSpike("Gate 2")}
              >
                🔴 Simulate Crowd Spike (Gate 2 - East)
              </button>
            ) : (
              <button 
                className="sim-btn active-alert" 
                onClick={() => onClearCrowdSpike("Gate 2")}
              >
                🟢 Clear Crowd Spike (Gate 2 - East)
              </button>
            )}

            {/* Gate 4 crowd spike toggle */}
            {!isGateSpiked("Gate 4") ? (
              <button 
                className="sim-btn" 
                onClick={() => onTriggerCrowdSpike("Gate 4")}
              >
                🔴 Simulate Crowd Spike (Gate 4 - West)
              </button>
            ) : (
              <button 
                className="sim-btn active-alert" 
                onClick={() => onClearCrowdSpike("Gate 4")}
              >
                🟢 Clear Crowd Spike (Gate 4 - West)
              </button>
            )}
          </div>
        </div>

        {/* Report New Incident */}
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div className="card-header-styled">
            <h3 className="card-title-styled">🚨 Report Incident (Venue Sensors / Fans)</h3>
          </div>
          <form onSubmit={handleSubmit} className="incident-form">
            <div className="form-group">
              <label htmlFor="op-incident-type" className="form-label">Incident Type</label>
              <select 
                id="op-incident-type"
                className="form-select" 
                value={formType} 
                onChange={(e) => setFormType(e.target.value)}
              >
                <option value="Cleanup">Cleanup (Spills, Trash)</option>
                <option value="Medical">Medical Emergency</option>
                <option value="Security">Security Concern</option>
                <option value="Facility">Facility Malfunction</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="op-incident-title" className="form-label">Incident Title</label>
              <input 
                id="op-incident-title"
                type="text" 
                className="form-input" 
                placeholder="e.g. Broken lock on restroom D4" 
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="op-incident-desc" className="form-label">Description</label>
              <textarea 
                id="op-incident-desc"
                className="form-textarea" 
                rows="3" 
                placeholder="Details of what happened..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="op-incident-loc" className="form-label">Location (Zone/Section)</label>
              <select 
                id="op-incident-loc"
                className="form-select" 
                value={formLoc} 
                onChange={(e) => setFormLoc(e.target.value)}
              >
                <option value="Zone A">Zone A - North Bowl</option>
                <option value="Zone B">Zone B - East Bowl</option>
                <option value="Zone C">Zone C - South Bowl</option>
                <option value="Zone D">Zone D - West Bowl</option>
                <option value="Zone E">Zone E - Upper Outer</option>
              </select>
            </div>

            <button type="submit" className="submit-btn">
              Dispatch & Let AI Recommend Solution
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Live Incident Log + AI Recommendations */}
      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        <div className="card-header-styled">
          <h3 className="card-title-styled">📋 Live Operations Log ({incidents.length} events)</h3>
        </div>

        <div className="incidents-list">
          {incidents.length === 0 ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
              No incidents reported. Stadium operations running smoothly! 🟢
            </div>
          ) : (
            incidents.map((incident) => {
              // Filter volunteers available or assigned to this incident
              const availableVols = volunteers.filter(v => v.status === "Available" || v.status.includes(incident.id));
              
              return (
                <div 
                  key={incident.id} 
                  className={`incident-card ${incident.status.toLowerCase()}`}
                >
                  <div className="incident-meta">
                    <span style={{ fontWeight: 800, color: "var(--secondary)" }}>{incident.id}</span>
                    <span>{incident.time} | 📍 {incident.location}</span>
                  </div>
                  
                  <div className="incident-title">
                    {incident.type === "Medical" ? "🏥" : incident.type === "Security" ? "🛡️" : incident.type === "Cleanup" ? "🧹" : "⚙️"}{" "}
                    {incident.title}
                  </div>
                  <div className="incident-desc">{incident.description}</div>
                  
                  {/* AI Recommendation Panel */}
                  <div className="ai-recommendation-box">
                    <strong>🧠 ArenaIQ AI Analysis:</strong>
                    <div style={{ marginTop: "0.25rem", fontStyle: "italic", fontSize: "0.8rem" }}>
                      {incident.aiRecommendation}
                    </div>
                  </div>

                  <div style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                    Status: <strong style={{ color: incident.status === "Resolved" ? "var(--primary)" : "var(--warning)" }}>{incident.status}</strong>
                    {incident.assignedVolunteer && (
                      <span> | Assigned: <strong>{incident.assignedVolunteer}</strong></span>
                    )}
                  </div>

                  {/* Dispatcher Actions */}
                  {incident.status !== "Resolved" && (
                    <div className="dispatch-controls">
                      {incident.status === "Active" ? (
                        <>
                          <label htmlFor={`vol-assign-${incident.id}`} style={{ display: "none" }}>Assign Volunteer</label>
                          <select 
                            id={`vol-assign-${incident.id}`}
                            className="dispatch-select"
                            value={selectedVolunteer[incident.id] || ""}
                            onChange={(e) => handleVolunteerSelect(incident.id, e.target.value)}
                          >
                            <option value="">-- Choose Available Staff --</option>
                            {availableVols.map((v, i) => (
                              <option key={i} value={v.name}>{v.avatar} {v.name} ({v.location})</option>
                            ))}
                          </select>
                          <button 
                            className="action-btn primary"
                            onClick={() => handleAssign(incident.id)}
                          >
                            Assign Staff
                          </button>
                        </>
                      ) : (
                        <button 
                          className="action-btn warning"
                          onClick={() => onResolveIncident(incident.id)}
                          style={{ width: "100%" }}
                        >
                          Resolve & Close Task
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

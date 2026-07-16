import React, { useState } from "react";

export default function TransitSustainability({ stadiumData, onLogEcoAction }) {
  const [username, setUsername] = useState("");
  const [ecoAction, setEcoAction] = useState("recycling");
  const [successMessage, setSuccessMessage] = useState("");

  if (!stadiumData) return <div style={{ color: "var(--text-muted)" }}>Loading transit telemetry...</div>;

  const { sustainability, transit, venue } = stadiumData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please enter a username or nickname.");
      return;
    }
    const result = await onLogEcoAction(username, ecoAction);
    if (result && result.pointsGained) {
      setSuccessMessage(`♻️ Thank you, ${username}! You've gained ${result.pointsGained} EcoPoints. Offsetting carbon by ${result.carbonOffset}kg!`);
      // Clear username after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
        setUsername("");
      }, 5000);
    }
  };

  return (
    <div className="incident-grid">
      
      {/* Left Column: EcoGoal Sustainability Tracker */}
      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        <div className="card-header-styled">
          <h3 className="card-title-styled" style={{ color: "var(--primary)" }}>🌱 GreenGoal Live Carbon Offset Engine</h3>
        </div>
        
        {/* Sustainability Live Metrics */}
        <div className="sustainability-stats">
          <div className="stat-box">
            <div className="stat-label">⚡ Live Stadium Carbon</div>
            <div className="stat-value blue">{venue.stadiumCarbonEmissionKgs.toFixed(1)} kg</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">🍾 Total Bottles Recycled</div>
            <div className="stat-value">{sustainability.totalRecycledPlastic} units</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">🌟 EcoPoints Distributed</div>
            <div className="stat-value">{sustainability.totalEcoPointsAwarded} pts</div>
          </div>
        </div>

        {/* Log Action form */}
        <div style={{ background: "rgba(0,0,0,0.15)", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.5rem", fontSize: "0.95rem" }}>📝 Submit Your Eco Action</h4>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            Participated in sustainable travel or waste reduction? Log it to decrease stadium emissions.
          </p>

          {successMessage && (
            <div style={{ 
              background: "rgba(0, 255, 135, 0.1)", 
              border: "1px solid var(--primary)", 
              color: "var(--primary)", 
              padding: "0.5rem", 
              borderRadius: "6px", 
              fontSize: "0.8rem", 
              marginBottom: "0.75rem" 
            }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div className="form-group">
              <label htmlFor="eco-username-input" style={{ display: "none" }}>Fan Nickname</label>
              <input 
                id="eco-username-input"
                type="text" 
                className="form-input" 
                placeholder="Enter nickname (e.g. EcoMessi_10)" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="eco-action-select" style={{ display: "none" }}>Select Eco Action</label>
              <select 
                id="eco-action-select"
                className="form-select" 
                value={ecoAction} 
                onChange={(e) => setEcoAction(e.target.value)}
              >
                <option value="recycling">Bottle Recycling in Stand (+25 pts)</option>
                <option value="public_transit">Took NJ Transit Train / Shuttle Bus (+40 pts)</option>
                <option value="bring_reusable_cup">Brought Reusable Cup / Mug (+15 pts)</option>
                <option value="carpool">Carpool with 4+ people (+30 pts)</option>
              </select>
            </div>

            <button type="submit" className="submit-btn" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #a3ff78 100%)" }}>
              Submit Eco Contribution
            </button>
          </form>
        </div>

        {/* Leaderboard */}
        <div>
          <h4 style={{ marginBottom: "0.5rem", fontSize: "0.95rem" }}>🏆 Eco Leaderboard</h4>
          <div className="leaderboard-list">
            {sustainability.leaderboard.map((user, idx) => (
              <div key={idx} className="leaderboard-item">
                <span className="leaderboard-rank">#{user.rank}</span>
                <span className="leaderboard-name">{user.name}</span>
                <span className="leaderboard-points">{user.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Smart Transit & Departure Portal */}
      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        <div className="card-header-styled">
          <h3 className="card-title-styled" style={{ color: "var(--secondary)" }}>🚆 Smart Transit & Crowd Departure</h3>
        </div>
        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Real-time integration with municipal transit agencies to monitor departure lines.
        </p>

        {/* Trains */}
        <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "0.75rem", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>🚆 NJ Transit Rail Link</span>
            <span className="gate-status-pill status-moderate" style={{ fontSize: "0.75rem" }}>Moderate Delay</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            Meadowlands Stadium Station Line to Secaucus / NYC Penn Station.
          </p>
          <div style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between" }}>
            <span>Frequency: every {transit.train.frequencyMins}m</span>
            <span>Est. Wait: <strong>{transit.train.waitTimeMins} mins</strong></span>
          </div>
          <div style={{ fontSize: "0.75rem", background: "rgba(255, 184, 0, 0.08)", padding: "0.3rem", borderRadius: "4px", border: "1px solid rgba(255,184,0,0.15)", marginTop: "0.4rem" }}>
            ⚠️ Status: {transit.train.status}
          </div>
        </div>

        {/* Bus */}
        <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "0.75rem", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>🚌 Port Authority Express Bus</span>
            <span className="gate-status-pill status-normal" style={{ fontSize: "0.75rem" }}>Regular Service</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            Direct shuttle buses to Port Authority Bus Terminal (NYC).
          </p>
          <div style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between" }}>
            <span>Frequency: every {transit.bus.frequencyMins}m</span>
            <span>Est. Wait: <strong>{transit.bus.waitTimeMins} mins</strong></span>
          </div>
        </div>

        {/* Rideshare */}
        <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "0.75rem", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>🚗 Uber & Lyft Hub</span>
            <span className="gate-status-pill status-critical" style={{ fontSize: "0.75rem" }}>Surge Pricing</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            Pickup Zone located at **Lot G** only. Follow blue path markers.
          </p>
          <div style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between" }}>
            <span>Surge Rate: <strong>{transit.rideshare.surgeMultiplier}x</strong></span>
            <span>Est. Dispatch Wait: <strong>{transit.rideshare.averageWaitMins}m</strong></span>
          </div>
        </div>

        {/* Parking Lot Occupancy */}
        <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <span style={{ fontWeight: "bold", fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>🅿️ Stadium Parking Occupancy</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span>Gold VIP Lot:</span>
              <strong style={{ color: "var(--accent)" }}>{transit.parking.GoldLot.occupied}/{transit.parking.GoldLot.capacity} ({transit.parking.GoldLot.status})</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span>Silver Lot B:</span>
              <strong style={{ color: "var(--warning)" }}>{transit.parking.SilverLot.occupied}/{transit.parking.SilverLot.capacity} (90%)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span>Park & Ride Express:</span>
              <strong style={{ color: "var(--primary)" }}>{transit.parking.ParkAndRide.occupied}/{transit.parking.ParkAndRide.capacity} (Open)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

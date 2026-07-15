import React from "react";

export default function Map({ stadiumData, onSelectZone, selectedZone, onSelectGate, selectedGate }) {
  if (!stadiumData) return <div style={{ color: "var(--text-muted)" }}>Loading map telemetry...</div>;

  const { zones, gates } = stadiumData;

  // Map zone key to SVG fill color based on current status
  const getZoneColor = (zoneKey) => {
    const zone = zones[zoneKey];
    if (!zone) return "rgba(255,255,255,0.05)";
    
    // Highlight if selected
    const isSelected = selectedZone === zoneKey;

    switch (zone.status) {
      case "Critical":
        return isSelected ? "rgba(255, 46, 147, 0.75)" : "rgba(255, 46, 147, 0.45)";
      case "High":
        return isSelected ? "rgba(255, 184, 0, 0.75)" : "rgba(255, 184, 0, 0.45)";
      case "Normal":
      default:
        return isSelected ? "rgba(0, 255, 135, 0.75)" : "rgba(0, 255, 135, 0.25)";
    }
  };

  // Map gate status to color
  const getGateColor = (gateId) => {
    const gate = gates.find(g => g.id === gateId);
    if (!gate) return "#9ca3af";
    
    switch (gate.status) {
      case "Critical":
      case "Crowded":
        return "var(--accent)";
      case "Moderate":
        return "var(--warning)";
      case "Normal":
      case "Clear":
      default:
        return "var(--primary)";
    }
  };

  return (
    <div className="map-container">
      <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        🏟️ Interactive Stadium Telemetry Map
      </h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem", textAlign: "center" }}>
        Select a zone or gate on the live map to inspect crowd densities, waiting times, and AI rerouting suggestions.
      </p>

      {/* SVG Stadium Map */}
      <svg viewBox="0 0 500 500" className="stadium-svg">
        <defs>
          <radialGradient id="fieldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ff87" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#080a0f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Grids */}
        <circle cx="250" cy="250" r="235" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <circle cx="250" cy="250" r="215" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

        {/* Outer Stadium Wall */}
        <ellipse cx="250" cy="250" rx="200" ry="160" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="6" />

        {/* Seating Bowl Zones */}
        {/* Zone A: North Bowl */}
        <path
          d="M 120 180 A 180 140 0 0 1 380 180 L 330 210 A 110 80 0 0 0 170 210 Z"
          fill={getZoneColor("A")}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={selectedZone === "A" ? 3 : 1}
          className="map-zone"
          onClick={() => onSelectZone("A")}
        />
        
        {/* Zone B: East Bowl */}
        <path
          d="M 380 180 A 180 140 0 0 1 380 320 L 330 290 A 110 80 0 0 0 330 210 Z"
          fill={getZoneColor("B")}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={selectedZone === "B" ? 3 : 1}
          className="map-zone"
          onClick={() => onSelectZone("B")}
        />

        {/* Zone C: South Bowl */}
        <path
          d="M 380 320 A 180 140 0 0 1 120 320 L 170 290 A 110 80 0 0 0 330 290 Z"
          fill={getZoneColor("C")}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={selectedZone === "C" ? 3 : 1}
          className="map-zone"
          onClick={() => onSelectZone("C")}
        />

        {/* Zone D: West Bowl */}
        <path
          d="M 120 320 A 180 140 0 0 1 120 180 L 170 210 A 110 80 0 0 0 170 290 Z"
          fill={getZoneColor("D")}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={selectedZone === "D" ? 3 : 1}
          className="map-zone"
          onClick={() => onSelectZone("D")}
        />

        {/* Zone E: Outer Upper Level Overlay ring */}
        <ellipse 
          cx="250" 
          cy="250" 
          rx="215" 
          ry="175" 
          fill="none" 
          stroke={getZoneColor("E")} 
          strokeWidth="10"
          strokeDasharray="40 12"
          style={{ cursor: "pointer" }}
          onClick={() => onSelectZone("E")}
        />

        {/* Turf Pitch (Inner Soccer Field) */}
        <rect x="195" y="210" width="110" height="80" fill="url(#fieldGlow)" stroke="#00ff87" strokeWidth="2" rx="3" />
        {/* Center Line and Circle */}
        <line x1="250" y1="210" x2="250" y2="290" stroke="rgba(0, 255, 135, 0.6)" strokeWidth="1.5" />
        <circle cx="250" cy="250" r="18" fill="none" stroke="rgba(0, 255, 135, 0.6)" strokeWidth="1.5" />

        {/* Interactive Gates Markers */}
        {/* Gate 1 (North) */}
        <g className="map-gate" onClick={() => onSelectGate("Gate 1")}>
          <circle cx="250" cy="70" r="12" fill={getGateColor("Gate 1")} stroke="#fff" strokeWidth="2" />
          <text x="250" y="74" fill="#0d111b" fontSize="10" fontWeight="bold" textAnchor="middle">1</text>
        </g>

        {/* Gate 2 (East) */}
        <g className="map-gate" onClick={() => onSelectGate("Gate 2")}>
          <circle cx="445" cy="250" r="12" fill={getGateColor("Gate 2")} stroke="#fff" strokeWidth="2" />
          <text x="445" y="254" fill="#0d111b" fontSize="10" fontWeight="bold" textAnchor="middle">2</text>
        </g>

        {/* Gate 3 (South) */}
        <g className="map-gate" onClick={() => onSelectGate("Gate 3")}>
          <circle cx="250" cy="430" r="12" fill={getGateColor("Gate 3")} stroke="#fff" strokeWidth="2" />
          <text x="250" y="434" fill="#0d111b" fontSize="10" fontWeight="bold" textAnchor="middle">3</text>
        </g>

        {/* Gate 4 (West) */}
        <g className="map-gate" onClick={() => onSelectGate("Gate 4")}>
          <circle cx="55" cy="250" r="12" fill={getGateColor("Gate 4")} stroke="#fff" strokeWidth="2" />
          <text x="55" y="254" fill="#0d111b" fontSize="10" fontWeight="bold" textAnchor="middle">4</text>
        </g>
      </svg>

      {/* SVG Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "rgba(0, 255, 135, 0.5)", border: "1px solid var(--primary)" }}></div>
          <span>Optimal (Normal)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "rgba(255, 184, 0, 0.5)", border: "1px solid var(--warning)" }}></div>
          <span>Moderate Load</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "rgba(255, 46, 147, 0.5)", border: "1px solid var(--accent)" }}></div>
          <span>Critical Density</span>
        </div>
      </div>
    </div>
  );
}

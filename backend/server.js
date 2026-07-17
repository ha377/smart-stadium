/**
 * @fileoverview Express application server for FIFA 2026 ArenaIQ.
 * Provides APIs for real-time stadium telemetry, operations control, incident reporting,
 * fan assistant chats, and sustainability tracking.
 */

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

// CORS configuration - allow all origins in development, restrict in production if needed
app.use(cors());
app.use(express.json());

/**
 * Recursively sanitizes string inputs to prevent HTML injections/XSS,
 * protecting against prototype pollution vulnerabilities.
 * @param {*} val - Value to sanitize.
 * @returns {*} The sanitized output.
 */
function sanitizeValue(val) {
  if (typeof val === "string") {
    return val
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === "object") {
    const sanitized = {};
    const keys = Object.keys(val);
    for (const key of keys) {
      if (key === "__proto__" || key === "constructor") {
        continue; // Prevent Prototype Pollution
      }
      sanitized[key] = sanitizeValue(val[key]);
    }
    return sanitized;
  }
  return val;
}

// Global sanitization middleware for request body
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
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
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Origin-Agent-Cluster", "?1");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
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

// Request Logger middleware
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
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt must be a non-empty string" });
  }
  if (lang && typeof lang !== "string") {
    return res.status(400).json({ error: "Language parameter must be a string" });
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
  if (!gateId || typeof gateId !== "string") {
    return res.status(400).json({ error: "gateId is required and must be a string" });
  }
  if (!action || (action !== "spike" && action !== "clear")) {
    return res.status(400).json({ error: "action must be 'spike' or 'clear'" });
  }

  const validGates = ["Gate 1", "Gate 2", "Gate 3", "Gate 4"];
  if (!validGates.includes(gateId)) {
    return res.status(404).json({ error: `Gate ${gateId} not found` });
  }

  let result;
  if (action === "spike") {
    result = simulateCrowdSpike(gateId);
  } else {
    result = clearCrowdSpike(gateId);
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
  if (!type || typeof type !== "string" || type.trim() === "") {
    return res.status(400).json({ error: "type is required and must be a non-empty string" });
  }
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required and must be a non-empty string" });
  }
  if (!description || typeof description !== "string" || description.trim() === "") {
    return res.status(400).json({ error: "description is required and must be a non-empty string" });
  }
  if (!location || typeof location !== "string" || location.trim() === "") {
    return res.status(400).json({ error: "location is required and must be a non-empty string" });
  }

  const validTypes = ["cleanup", "medical", "security", "facility"];
  if (!validTypes.includes(type.toLowerCase())) {
    return res.status(400).json({ error: "type must be Cleanup, Medical, Security, or Facility" });
  }

  const incident = reportIncident(type, title, description, location);
  res.json({ message: "Incident reported successfully", incident, incidents: stadiumState.incidents });
});

// Operations endpoint: Assign volunteer to incident
app.post("/api/incidents/assign", (req, res) => {
  const { incidentId, volunteerName } = req.body;
  if (!incidentId || typeof incidentId !== "string" || incidentId.trim() === "") {
    return res.status(400).json({ error: "incidentId is required and must be a non-empty string" });
  }
  if (!volunteerName || typeof volunteerName !== "string" || volunteerName.trim() === "") {
    return res.status(400).json({ error: "volunteerName is required and must be a non-empty string" });
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
  if (!incidentId || typeof incidentId !== "string" || incidentId.trim() === "") {
    return res.status(400).json({ error: "incidentId is required and must be a non-empty string" });
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
  const { username, actionType } = req.body;
  if (!username || typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({ error: "username is required and must be a non-empty string" });
  }
  if (!actionType || typeof actionType !== "string") {
    return res.status(400).json({ error: "actionType is required and must be a string" });
  }

  const validActionTypes = ["recycling", "public_transit", "bring_reusable_cup", "carpool", "bottle_refill", "waste_sorting"];
  if (!validActionTypes.includes(actionType)) {
    return res.status(400).json({ error: `Invalid actionType. Allowed values are: ${validActionTypes.join(", ")}` });
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

const isTesting = process.env.NODE_ENV === "test" || process.argv.includes("--test") || process.argv.some(arg => arg.includes(".test."));

if (!isTesting) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚽ FIFA 2026 ArenaIQ API Server started on port ${PORT}`);
    console.log(`🚀 Ready to receive stadium operations requests`);
    console.log(`====================================================`);
  });
}

export { sanitizeValue };


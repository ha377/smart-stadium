import test from "node:test";
import assert from "node:assert";

// Mock helper functions representing the React formatting utilities
function formatMins(mins) {
  if (mins === undefined || mins === null) return "Unknown";
  if (mins === 1) return "1 min";
  return `${mins} mins`;
}

function calculateLoadPercentage(current, capacity) {
  if (!capacity || capacity <= 0) return 0;
  if (current < 0) return 0;
  return Math.round((current / capacity) * 100);
}

test("1. formatMins utility test", () => {
  assert.strictEqual(formatMins(1), "1 min");
  assert.strictEqual(formatMins(12), "12 mins");
  assert.strictEqual(formatMins(null), "Unknown");
  assert.strictEqual(formatMins(undefined), "Unknown");
});

test("2. calculateLoadPercentage utility test", () => {
  assert.strictEqual(calculateLoadPercentage(5000, 10000), 50);
  assert.strictEqual(calculateLoadPercentage(15000, 15000), 100);
  assert.strictEqual(calculateLoadPercentage(0, 5000), 0);
});

test("3. formatMins boundary and type edge cases", () => {
  assert.strictEqual(formatMins(0), "0 mins");
  assert.strictEqual(formatMins(-5), "-5 mins");
  assert.strictEqual(formatMins(9999), "9999 mins");
});

test("4. calculateLoadPercentage division-by-zero and negative boundary edge cases", () => {
  // Capacity is zero
  assert.strictEqual(calculateLoadPercentage(5000, 0), 0);
  // Capacity is negative
  assert.strictEqual(calculateLoadPercentage(5000, -100), 0);
  // Current is negative
  assert.strictEqual(calculateLoadPercentage(-500, 1000), 0);
  // Float numbers
  assert.strictEqual(calculateLoadPercentage(1.5, 4.5), 33);
});

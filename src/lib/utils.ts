import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROUTING_TABLE: string = path.resolve(
  __dirname,
  "../db/routing_table.json"
);
export const NODE_ID_FILE = path.resolve(__dirname, "../db/node_id.json");
export const SIGNAL_SERVER_URL = "ws://localhost:8080";

// Generate a unique node ID (SHA-256 hash of a random value)
export function generateNodeId(port: number): string {
  if (fs.existsSync(NODE_ID_FILE)) {
    const data = JSON.parse(fs.readFileSync(NODE_ID_FILE, "utf-8"));

    // If an ID for the specified port exists, return it
    if (data[port]) {
      return data[port];
    }
  }

  // Generate a new ID if not found
  const newId = crypto
    .createHash("sha256")
    .update(crypto.randomBytes(32))
    .digest("hex");

  // Load or create the data object to store the port-ID mapping
  const data = fs.existsSync(NODE_ID_FILE)
    ? JSON.parse(fs.readFileSync(NODE_ID_FILE, "utf-8"))
    : {};

  // Add the new ID to the JSON structure under the specified port
  data[port] = newId;

  // Save updated data to node_id.json
  fs.writeFileSync(NODE_ID_FILE, JSON.stringify(data, null, 2));

  return newId;
}

// Calculate XOR distance between two node IDs
export function calculateDistance(id1: string, id2: string): number {
  return parseInt(id1, 16) ^ parseInt(id2, 16);
}

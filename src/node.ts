import WebSocket from "ws";
import { generateNodeId, SIGNAL_SERVER_URL } from "./lib/utils";
import { DHT } from "./lib/dht";
import { saveRoutingTable, loadRoutingTable } from "./db/storage";

const portArgIndex = process.argv.indexOf("--") + 1;
const parsedPort =
  portArgIndex > 0 ? parseInt(process.argv[portArgIndex]) : NaN;
const PORT = isNaN(parsedPort) ? 3333 : parsedPort;

const nodeId = generateNodeId(PORT);
const dht = new DHT(nodeId);
const ws = new WebSocket(SIGNAL_SERVER_URL);

dht.routingTable = loadRoutingTable(); // Load from persistent storage

ws.on("open", () => {
  console.log("Connected to signaling server");

  ws.send(
    JSON.stringify({
      type: "register",
      id: nodeId,
      ip: "127.0.0.1",
      port: PORT,
    })
  );

  ws.send(JSON.stringify({ type: "getNodes" }));
});

ws.on("message", (data) => {
  const message = JSON.parse(data.toString());

  if (message.type === "nodesList") {
    message.nodes.forEach(
      (nodeInfo: { id: string; ip: string; port: number }) => {
        dht.addNode(nodeInfo.id, nodeInfo.ip, nodeInfo.port);
      }
    );
    console.log("Received node list from signaling server");
  }
});

function periodicSave() {
  saveRoutingTable(dht.routingTable);
}
setInterval(periodicSave, 60000); // Save every minute

function healthCheck() {
  // Simplified health check by pinging each known node
  dht.routingTable.forEach(({ ip, port }, nodeId) => {
    const nodeWs = new WebSocket(`ws://${ip}:${port}`);
    nodeWs.on("open", () => nodeWs.close());
    nodeWs.on("error", () => dht.routingTable.delete(nodeId));
  });
}
setInterval(healthCheck, 60000);

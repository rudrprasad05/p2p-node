// signalServer.ts
import { WebSocket, WebSocketServer } from "ws";

interface ClientInfo {
  id: string;
  ip: string;
  port: number;
  ws: WebSocket;
}

const PORT = 8080;
const clients: Map<string, ClientInfo> = new Map();

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`Signaling server running on ws://localhost:${PORT}`);
});

wss.on("connection", (ws) => {
  let clientId: string | null = null;

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (!data || data == "") {
      return;
    }

    switch (data.type) {
      case "register":
        clientId = data.id;
        if (clientId)
          clients.set(clientId, {
            id: data.id,
            ip: data.ip,
            port: data.port,
            ws,
          });
        console.log(`Registered node: ${clientId} at ${data.ip}:${data.port}`);
        break;

      case "getNodes":
        const nodes = Array.from(clients.values())
          .filter((client) => client.id !== clientId)
          .map((client) => ({
            id: client.id,
            ip: client.ip,
            port: client.port,
          }));
        ws.send(JSON.stringify({ type: "nodesList", nodes }));
        break;
    }
  });

  ws.on("close", () => {
    if (clientId) {
      clients.delete(clientId);
      console.log(`Node ${clientId} disconnected`);
    }
  });
});

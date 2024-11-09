import fs from "fs";
import { NodeInfo } from "../lib/dht";
import { ROUTING_TABLE } from "../lib/utils";

export function saveRoutingTable(routingTable: Map<string, NodeInfo>): void {
  fs.writeFileSync(
    ROUTING_TABLE,
    JSON.stringify(Array.from(routingTable.entries()))
  );
}

export function loadRoutingTable(): Map<string, NodeInfo> {
  if (fs.existsSync(ROUTING_TABLE)) {
    return new Map(JSON.parse(fs.readFileSync(ROUTING_TABLE, "utf-8")));
  }
  return new Map();
}

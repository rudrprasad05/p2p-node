import { calculateDistance } from "./utils";

export interface NodeInfo {
  nodeId: string;
  ip: string;
  port: number;
}

export class DHT {
  routingTable: Map<string, NodeInfo> = new Map();
  dataStore: Map<string, string> = new Map();

  constructor(public readonly nodeId: string) {}

  addNode(nodeId: string, ip: string, port: number): void {
    this.routingTable.set(nodeId, { nodeId, ip, port });
  }

  getClosestNodes(targetId: string, k: number = 20): NodeInfo[] {
    return Array.from(this.routingTable.values())
      .sort(
        (a, b) =>
          calculateDistance(targetId, a.nodeId) -
          calculateDistance(targetId, b.nodeId)
      )
      .slice(0, k);
  }

  storeData(key: string, value: string): void {
    const closestNode = this.getClosestNodes(key)[0];
    if (closestNode?.nodeId === this.nodeId) {
      this.dataStore.set(key, value);
    }
  }

  lookupData(key: string): string | undefined {
    const closestNode = this.getClosestNodes(key)[0];
    if (closestNode?.nodeId === this.nodeId) {
      return this.dataStore.get(key);
    }
  }
}

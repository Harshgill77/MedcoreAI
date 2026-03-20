import { PrismaClient } from "@prisma/client";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { WebSocket } from "ws";

// Use WebSocket constructor so @neondatabase/serverless works in Node.js
neonConfig.webSocketConstructor = WebSocket;

declare global {
  // eslint-disable-next-line no-var
  var __prismaUser: PrismaClient | undefined;
}

function getPrismaClient(): PrismaClient {
  if (global.__prismaUser) return global.__prismaUser;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("[Prisma] DATABASE_URL is not set. Check your .env file.");
  }

  // PrismaNeon uses WebSocket to connect — bypasses TCP port 5432 block
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaNeon(pool) as any;

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    global.__prismaUser = client;
  }

  return client;
}

export const prismaUser: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

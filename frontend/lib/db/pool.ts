/**
 * lib/db/pool.ts
 * Shared singleton Neon Pool — reuses WebSocket connections across requests,
 * eliminating per-request connection handshake latency.
 */
import { neonConfig, Pool } from "@neondatabase/serverless";
import { WebSocket } from "ws";

neonConfig.webSocketConstructor = WebSocket;

// Keep pool alive in dev across hot reloads
declare global {
    // eslint-disable-next-line no-var
    var __neonPool: Pool | undefined;
}

function createPool() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("[DB] DATABASE_URL is not set");
    return new Pool({ connectionString: url, max: 10 });
}

export const pool: Pool =
    global.__neonPool ?? (global.__neonPool = createPool());

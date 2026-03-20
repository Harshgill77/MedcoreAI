import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { pool } from "@/lib/db/pool";

// Get all messages for a specific session
export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: sessionId } = await props.params;

    try {
        const { rows: sessionRows } = await pool.query(
            `SELECT id FROM "ChatSession" WHERE id = $1 AND "userId" = $2 LIMIT 1`,
            [sessionId, userId]
        );
        if (sessionRows.length === 0) {
            return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
        }

        const { rows: messages } = await pool.query(
            `SELECT id, "chatSessionId", role, content, "jsonPayload", "createdAt"
       FROM "Message"
       WHERE "chatSessionId" = $1
       ORDER BY "createdAt" ASC`,
            [sessionId]
        );
        return NextResponse.json({ messages });
    } catch (err: any) {
        console.error("Error fetching messages:", err);
        return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
    }
}

// Add a new message to the session
export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: sessionId } = await props.params;

    try {
        const { rows: sessionRows } = await pool.query(
            `SELECT id FROM "ChatSession" WHERE id = $1 AND "userId" = $2 LIMIT 1`,
            [sessionId, userId]
        );
        if (sessionRows.length === 0) {
            return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
        }

        const body = await req.json();
        const { role, content, jsonPayload } = body;
        if (!role || !content) {
            return NextResponse.json({ error: "Role and content are required" }, { status: 400 });
        }

        const { rows: messageRows } = await pool.query(
            `INSERT INTO "Message" (id, "chatSessionId", role, content, "jsonPayload", "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
       RETURNING id, "chatSessionId", role, content, "jsonPayload", "createdAt"`,
            [sessionId, role, content, jsonPayload ? JSON.stringify(jsonPayload) : null]
        );

        await pool.query(
            `UPDATE "ChatSession" SET "updatedAt" = NOW() WHERE id = $1`,
            [sessionId]
        );

        return NextResponse.json({ message: messageRows[0] }, { status: 201 });
    } catch (err: any) {
        console.error("Error creating message:", err);
        return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
    }
}

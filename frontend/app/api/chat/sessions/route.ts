import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { pool } from "@/lib/db/pool";

export async function GET(req: NextRequest) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    try {
        const { rows: sessions } = await pool.query(
            `SELECT id, "userId", title, "createdAt", "updatedAt"
       FROM "ChatSession"
       WHERE "userId" = $1
       ORDER BY "updatedAt" DESC`,
            [userId]
        );
        return NextResponse.json({ sessions });
    } catch (err: any) {
        console.error("Error fetching sessions:", err);
        return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const title = body.title || "New Chat";
    try {
        const { rows } = await pool.query(
            `INSERT INTO "ChatSession" (id, "userId", title, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW())
       RETURNING id, "userId", title, "createdAt", "updatedAt"`,
            [userId, title]
        );
        return NextResponse.json({ session: rows[0] }, { status: 201 });
    } catch (err: any) {
        console.error("Error creating session:", err);
        return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
    }
}

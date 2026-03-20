import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ path: string[] }> }
) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session || !session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const params = await props.params;
        const pathSuffix = params.path.join("/");
        const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

        let body;
        try {
            // Forward body exactly as json
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const response = await fetch(`${backendUrl}/api/diagnose/${pathSuffix}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Internal-Secret": process.env.SHARED_SECRET || "jaskirat123",
                "X-Session-Id": req.headers.get("x-session-id") || userId
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Proxy error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

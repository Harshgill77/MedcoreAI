// /api/auth/verify/route.ts — handles the email verification link click
import { pool } from "@/lib/db/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Find the active verification token
    const { rows } = await pool.query(
      `SELECT identifier, expires FROM "VerificationToken"
       WHERE token = $1 AND type = 'UserVerification' AND status = 'Active'
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid or already used token" }, { status: 404 });
    }

    const validToken = rows[0];

    if (Number(validToken.expires) < Date.now()) {
      await pool.query(
        `UPDATE "VerificationToken" SET status = 'Expired'
         WHERE token = $1 AND type = 'UserVerification'`,
        [token]
      );
      return NextResponse.json({ error: "Token has expired. Please sign up again." }, { status: 400 });
    }

    // Mark token as accepted and set emailVerified on the user — both in one transaction
    await pool.query("BEGIN");
    try {
      await pool.query(
        `UPDATE "VerificationToken" SET status = 'Accepted'
         WHERE token = $1 AND type = 'UserVerification'`,
        [token]
      );

      const { rows: userRows } = await pool.query(
        `UPDATE "User" SET "emailVerified" = NOW(), "updatedAt" = NOW()
         WHERE email = $1
         RETURNING id, name, email, "createdAt", "emailVerified"`,
        [validToken.identifier]
      );

      await pool.query("COMMIT");

      return NextResponse.json(userRows[0], { status: 200 });
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (error: any) {
    console.error("[Verify] Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// /api/register/route.ts
import bcrypt from "bcrypt";
import { pool } from "@/lib/db/pool";
import { NextResponse } from "next/server";
import { sendMail } from "../utils/mailer";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const { rows: existing } = await pool.query(
      `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const hashedVerificationToken = await bcrypt.hash(
      JSON.stringify({ name, email, date: Date.now() }),
      12
    );

    // ⚠️ emailVerified is NULL — user must click the verification link before logging in
    const { rows: userRows } = await pool.query(
      `INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW())
       RETURNING id, name, email, "createdAt"`,
      [name || email.split("@")[0], email, hashedPassword]
    );
    const user = userRows[0];

    // Verification token expires in 48 hours
    const expires = (Date.now() + 1000 * 60 * 60 * 48).toString();
    await pool.query(
      `INSERT INTO "VerificationToken" (identifier, token, expires, type, status)
       VALUES ($1, $2, $3, 'UserVerification', 'Active')`,
      [email, hashedVerificationToken, expires]
    );

    // Send verification email — throws if it fails so the user knows
    await sendMail(
      email,
      `${process.env.NEXTAUTH_URL}/verify?token=${hashedVerificationToken}`,
      "verificationLink"
    );

    return NextResponse.json(
      { message: "Account created. Check your email to verify your account before logging in." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Register] Error:", error);
    return NextResponse.json({ error: "Something went wrong: " + error.message }, { status: 500 });
  }
}
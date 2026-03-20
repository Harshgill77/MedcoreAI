import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db/pool";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { rows } = await pool.query(
          `SELECT id, name, email, password, "emailVerified" FROM "User" WHERE email = $1 LIMIT 1`,
          [credentials.email]
        );
        const user = rows[0];
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Block login if email has not been verified yet
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { rows } = await pool.query(
            `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
            [user.email!]
          );

          let userId: string;
          if (rows.length === 0) {
            const { rows: newRows } = await pool.query(
              `INSERT INTO "User" (id, name, email, image, "emailVerified", "createdAt", "updatedAt")
               VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW(), NOW())
               RETURNING id`,
              [user.name || user.email!.split("@")[0], user.email, user.image]
            );
            userId = newRows[0].id;
          } else {
            userId = rows[0].id;
          }

          const { rows: accountRows } = await pool.query(
            `SELECT id FROM "Account" WHERE "userId" = $1 AND provider = 'google' LIMIT 1`,
            [userId]
          );

          if (accountRows.length === 0) {
            await pool.query(
              `INSERT INTO "Account" (id, "userId", type, provider, "providerAccountId", access_token, refresh_token, expires_at, token_type, scope, id_token)
               VALUES (gen_random_uuid()::text, $1, 'oauth', 'google', $2, $3, $4, $5, $6, $7, $8)`,
              [
                userId,
                account.providerAccountId,
                account.access_token ?? null,
                account.refresh_token ?? null,
                account.expires_at ?? null,
                account.token_type ?? null,
                account.scope ?? null,
                account.id_token ?? null,
              ]
            );
          }
        } catch (err) {
          console.error("[NextAuth] Google signIn error:", err);
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        try {
          const { rows } = await pool.query(
            `SELECT id, name, email, "emailVerified", image FROM "User" WHERE email = $1 LIMIT 1`,
            [user.email]
          );
          const dbUser = rows[0];
          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.emailVerified = dbUser.emailVerified;
            token.picture = dbUser.image ?? token.picture;
          } else {
            token.id = user.id ?? token.sub;
            token.name = user.name;
            token.email = user.email;
          }
        } catch {
          token.id = user.id ?? token.sub;
          token.name = user.name;
          token.email = user.email;
        }
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (session.emailVerified) token.emailVerified = session.emailVerified;
      }

      return token;
    },

    async session({ session, token }: any) {
      session.user.id = token.id;
      session.user.emailVerified = token.emailVerified;
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/chat`;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/signout",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validators/auth";

// Session strategy note: the Credentials provider requires Auth.js's "jwt"
// strategy. That JWT is Auth.js's encrypted, httpOnly session cookie — the
// cookie-based session model required by ARCHITECTURE.md. It is NOT a
// client-side token; nothing is ever stored in localStorage/sessionStorage.
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const passwordValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!passwordValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, token }) {
      // Auth.js sets token.sub to the user id on sign-in; expose it on the
      // session so actions/queries can reference the current user.
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

import NextAuth from "next-auth";
import type { NextAuthOptions, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

type TokenWithFlags = {
  id?: string;
  isAdmin?: boolean;
};

type SessionUser = Session["user"] & TokenWithFlags;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, persist user.id into the token
      if (user) {
        const usr = user as User & TokenWithFlags;
        token.id = usr.id;
        token.isAdmin = usr.isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      // expose token id on session.user
      if (session.user) {
        const user = session.user as SessionUser;
        const tok = token as TokenWithFlags;
        user.id = tok.id;
        user.isAdmin = tok.isAdmin ?? false;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

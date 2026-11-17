import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

      if (pathname === "/") return true;
      if (isAuthPage) return true;
      if (pathname.startsWith("/api/auth")) return true;
      if (pathname.startsWith("/api")) return isLoggedIn;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;

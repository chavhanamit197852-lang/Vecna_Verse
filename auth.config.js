import { NextResponse } from "next/server";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],

  callbacks: {
    authorized({ auth, request }) {
      const p = request.nextUrl.pathname;
      const user = auth?.user;
      const role = user?.role;

      // ─── ADMIN ONLY ───
      if (p.startsWith("/admin")) {
        if (role === "ADMIN") return true;
        if (user) return NextResponse.redirect(new URL("/dashboard", request.url));
        return false; // anonymous → /login
      }

      // ─── CLUB_ADMIN or ADMIN ───
      if (p.startsWith("/club")) {
        if (role === "ADMIN" || role === "CLUB_ADMIN") return true;
        if (user) return NextResponse.redirect(new URL("/dashboard", request.url));
        return false;
      }

      // ─── ANY LOGGED-IN USER ───
      if (p.startsWith("/dashboard")) {
        return !!user;
      }

      // ─── PUBLIC ───
      return true;
    },
  },
};
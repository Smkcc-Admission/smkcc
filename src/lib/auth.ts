import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";
import { logActivity } from "./audit";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // เช็คว่าอีเมลนี้มีในฐานข้อมูลและเป็น Admin/Staff หรือไม่
        const existingAdmin = await prisma.adminUser.findUnique({
          where: { email: user.email! },
        });
        
        if (existingAdmin) {
          logActivity({ action: "LOGIN", adminEmail: user.email!, details: "Logged in" });
          return true; // อนุญาตให้เข้าสู่ระบบได้
        } else {
          return false; // ปฏิเสธการเข้าสู่ระบบ
        }
      }
      return false;
    },
    async session({ session, user, token }) {
      if (session.user?.email) {
        const existingAdmin = await prisma.adminUser.findUnique({
          where: { email: session.user.email },
        });
        if (existingAdmin) {
          // เช็คและเพิ่ม role ให้ session
          (session.user as any).role = existingAdmin.role;
          (session.user as any).programId = existingAdmin.programId;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/error', // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
  },
};

export const handler = NextAuth(authOptions);


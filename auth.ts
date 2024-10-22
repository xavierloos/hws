import { db } from "@/lib/db"; //
import authConfig from "@/auth.config"; //
import { getUserById } from "@/data/user"; //
import { PrismaAdapter } from "@auth/prisma-adapter"; //
import NextAuth from "next-auth"; //
import { getOTPConfirmationByUserId } from "./data/oTPConfirmation"; //
import { UserRole } from "@prisma/client"; //
import { getAccountByUserId } from "./data/account";
import GitHub from "next-auth/providers/github";
import { storage } from "./lib/gcp";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/hws/login",
    error: "/hws/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id);
      //Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser?.otpEnabled) {
        const otpConfirmation = await getOTPConfirmationByUserId(existingUser.id);

        if (!otpConfirmation) return false;

        await db.oTPConfirmation.delete({
          where: { id: otpConfirmation.id },
        });
      }

      return true;
    },
    async session({ token, session }) {
      if (token.id && session.user) session.user.id = token.id;

      if (token.role && session.user) session.user.role = token.role as UserRole;

      if (session.user) session.user.otpEnabled = token.otpEnabled as boolean;

      if (session.user) {
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.permission = token.permission;
      }
      if (session.user.image && session.user.image.includes(session.user.id)) {
        const options = {
          version: "v2", // defaults to 'v2' if missing.
          action: "read",
          expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in one hour
        };
        const [url] = await storage
          .bucket(`${process.env.GCP_BUCKET}`)
          .file(`profiles/${session.user.id}/${session.user.image}`)
          .getSignedUrl(options);
        session.user.tempUrl = url;
        
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);
      if (!existingUser) return token;

      token.id = existingUser.id;
      token.isOAuth = !!existingAccount;
      token.username = existingUser.username;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.permission = existingUser.permission;
      token.otpEnabled = existingUser.otpEnabled;
      token.about = existingUser.about;
      

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  // providers: [GitHub],
});

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { SigninSchema } from "./lib";
import bcrypt from "bcryptjs";

const isProd = process.env.NODE_ENV === "production";
const resolvedAuthSecret = process.env.NEXTAUTH_SECRET || "dev-nextauth-secret";

if (!process.env.NEXTAUTH_SECRET) {
  const message =
    "NEXTAUTH_SECRET is not set. Add it to your environment for stable authentication.";
  if (isProd) {
    console.warn(message);
  } else {
    console.info(`${message} Using a development fallback secret.`);
  }
}

const resolvedNextAuthUrl =
  process.env.NEXTAUTH_URL || (!isProd ? "http://localhost:3000" : undefined);

if (!process.env.NEXTAUTH_URL && isProd) {
  console.warn("NEXTAUTH_URL is not set. Set it to your deployment URL.");
}

if (!process.env.NEXTAUTH_URL && resolvedNextAuthUrl) {
  process.env.NEXTAUTH_URL = resolvedNextAuthUrl;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  secret: resolvedAuthSecret,
  trustHost: true,
  events: {
    async linkAccount({ user }) {
      try {
        await db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      } catch (error) {
        console.error(
          "Failed to update emailVerified during linkAccount:",
          error,
        );
      }
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await db.user.findUnique({
            // @ts-ignore
            where: { email: user?.email },
          });

          if (existingUser) {
            if (!existingUser.emailVerified) {
              await db.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() },
              });
            }

            return true;
          } else {
            return true;
          }
        } catch (error) {
          console.error("Error in Google sign in:", error);
          return false;
        }
      }

      try {
        const existingUser = await db.user.findUnique({
          where: { id: user.id },
        });

        // Prevent sign in without email verification
        if (!existingUser || !existingUser.emailVerified) return false;

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(db),
  providers: [
    ...authConfig.providers!,
    Credentials({
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const validatedFields = SigninSchema.safeParse(credentials);

        if (!validatedFields.success) return null;

        const { loginId, password } = validatedFields.data;

        const user = await db.user.findUnique({
          where: { loginId },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) return null;

        return user;
      },
    }),
  ],
});

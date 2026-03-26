import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { SigninSchema } from "./lib";
import bcrypt from "bcryptjs";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
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
          error
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
            // @ts-expect-error — user.email exists at runtime from the OAuth profile
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

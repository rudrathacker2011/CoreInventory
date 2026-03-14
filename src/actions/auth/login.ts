"use server";

import { SigninSchema } from "@/lib";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/token";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export const Signin = async (
  values: z.infer<typeof SigninSchema>,
  callbackUrl?: string | null
) => {
  const validatedFields = SigninSchema.safeParse(values);

  if (validatedFields.error) return { error: "Invalid fields!" };

  const { loginId, password } = validatedFields.data;

  // Find user by loginId
  const existingUser = await db.user.findUnique({
    where: { loginId },
  });

  if (!existingUser || !existingUser.password)
    return { error: "Invalid Login Id or Password" };

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    try {
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
        existingUser.name
      );
    } catch (error) {
      console.error("Verification email failed:", error);
    }

    return { error: "Email not verified. Confirmation email sent!" };
  }

  const check = await bcrypt.compare(password, existingUser.password);

  if (!check) return { error: "Invalid Login Id or Password" };

  // Return the email for NextAuth signIn (credentials provider still uses email internally)
  return { success: true, email: existingUser.email };
};

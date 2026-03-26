"use server";

import { SigninSchema } from "@/lib";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/token";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export const Signin = async (
  values: z.infer<typeof SigninSchema>
) => {
  const validatedFields = SigninSchema.safeParse(values);

  if (validatedFields.error) return { error: "Invalid fields!" };

  const { loginId, password } = validatedFields.data;

  let existingUser;
  try {
    // Find user by loginId
    existingUser = await db.user.findUnique({
      where: { loginId },
    });
  } catch (error) {
    console.error("Database error during login:", error);
    return { error: "Something went wrong. Please try again later." };
  }

  if (!existingUser || !existingUser.password)
    return { error: "Invalid Login Id or Password" };

  if (!existingUser.emailVerified) {
    try {
      const verificationToken = await generateVerificationToken(
        existingUser.email
      );

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

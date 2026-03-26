"use server";

import { RegisterSchema } from "@/lib";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/token";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export const Register = async (values: z.infer<typeof RegisterSchema>) => {
  const validation = RegisterSchema.safeParse(values);

  if (validation.error) return { error: "Invalid fields!", success: "" };

  const { loginId, email, password } = validation.data;

  let existingLoginId, existingEmail;
  try {
    // Check if loginId already exists
    existingLoginId = await db.user.findUnique({
      where: { loginId },
    });

    // Check if email already exists
    existingEmail = await db.user.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error("Database error during signup check:", error);
    return { error: "Something went wrong. Please try again later.", success: "" };
  }

  if (existingLoginId)
    return { error: "Login ID is already taken!", success: "" };

  if (existingEmail)
    return { error: "Email is already registered!", success: "" };

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.user.create({
      data: {
        loginId,
        name: loginId, // Use loginId as display name initially
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error("Database error during user creation:", error);
    return { error: "Failed to create account. Please try again.", success: "" };
  }

  try {
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
      loginId
    );
  } catch (error) {
    console.error("Error while sending Verification Mail:", error);
    return {
      error: "",
      success: "Account created! Please log in to resend the verification email.",
    };
  }

  return { success: "Confirmation email sent!" };
};

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

  // Check if loginId already exists
  const existingLoginId = await db.user.findUnique({
    where: { loginId },
  });

  if (existingLoginId)
    return { error: "Login ID is already taken!", success: "" };

  // Check if email already exists
  const existingEmail = await db.user.findUnique({
    where: { email },
  });

  if (existingEmail)
    return { error: "Email is already registered!", success: "" };

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      loginId,
      name: loginId, // Use loginId as display name initially
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);

  try {
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
      loginId
    );
  } catch (error) {
    console.error("Error while sending Verification Mail:", error);
  }

  return { success: "Confirmation email sent!" };
};

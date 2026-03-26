"use server";

import * as z from "zod";
import { ResetSchema } from "@/lib";
import { getUserByEmail } from "@/data/user";
import { sendPasswordResetEmail } from "@/lib/email";
import { generatePasswordResetToken } from "@/lib/token";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "Email not found!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  const sendResult = await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  if (!sendResult.ok) {
    return { error: "Failed to send reset email. Please try again." };
  }

  return { success: "Reset email sent!" };
};

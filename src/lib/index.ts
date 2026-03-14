import * as z from "zod";

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$#!%*?&]{8,}$/,
);

// Login schema — uses loginId (not email)
export const SigninSchema = z.object({
  loginId: z
    .string()
    .min(1, { message: "Login ID is required" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

// Register schema — loginId, email, password, confirmPassword
export const RegisterSchema = z
  .object({
    loginId: z
      .string()
      .min(6, { message: "Login ID must be at least 6 characters" })
      .max(12, { message: "Login ID must be at most 12 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Login ID can only contain letters, numbers, and underscores",
      }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(passwordValidation, {
        message:
          "Password must include uppercase, lowercase, digit, and special character",
      }),
    confirmPassword: z.string().min(1, { message: "Please re-enter your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(passwordValidation, {
      message:
        "Password must include uppercase, lowercase, digit, and special character",
    }),
});

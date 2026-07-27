"use server";

import "server-only";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { loginSchema, type LoginFormState } from "@/validators/auth";

export async function login(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email address and password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { error: "Invalid email or password." };
    }
    // signIn throws NEXT_REDIRECT on success — rethrow anything that isn't
    // a credentials failure.
    throw error;
  }
  return undefined;
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

import type { Metadata } from "next";

import { login } from "@/actions/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in — blog.db",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">blog.db</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your blog
        </p>
      </div>
      <LoginForm loginAction={login} />
    </main>
  );
}

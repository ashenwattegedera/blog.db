import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="font-semibold">
              blog.db
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Posts
            </Link>
            <Link
              href="/dashboard/media"
              className="text-muted-foreground hover:text-foreground"
            >
              Media
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              View site
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

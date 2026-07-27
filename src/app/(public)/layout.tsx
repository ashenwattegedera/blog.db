import Link from "next/link";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            blog.db
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 text-sm text-muted-foreground">
          blog.db — a personal blog
        </div>
      </footer>
    </div>
  );
}

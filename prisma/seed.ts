// Seed script — runs outside Next.js via `npx prisma db seed` (or `npx tsx
// prisma/seed.ts`), so it must NOT import from src/lib/prisma.ts (the
// `server-only` guard throws outside the React Server Components bundler).
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Admin", passwordHash },
  });
  console.log(`Seeded admin user: ${admin.email}`);

  await prisma.category.upsert({
    where: { slug: "general" },
    update: {},
    create: { name: "General", slug: "general" },
  });
  console.log("Seeded category: General");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding dummy user_roles...");

  // Fetch existing users, roles, chapters, ministry_types
  const users = await prisma.user.findMany({});
  const roles = await prisma.role.findMany({ where: { id: { not: 1 } } }); // skip super admin
  const chapters = await prisma.chapter.findMany({});
  const ministryTypes = await prisma.ministryType.findMany({});

  // Fetch existing user_roles
  const existingUserRoles = await prisma.userRole.findMany({});

  // Create 50 dummy user_roles
  let count = 0;
  for (const user of users) {
    if (count >= 50) break;
    // Skip if user already has a userRole
    const hasRole = existingUserRoles.some(ur => ur.user_id === user.id);
    if (hasRole) continue;
    // Random role, chapter, ministry_type
    const role = roles[Math.floor(Math.random() * roles.length)];
    const chapter = chapters[Math.floor(Math.random() * chapters.length)];
    const ministryType = ministryTypes[Math.floor(Math.random() * ministryTypes.length)];
    await prisma.userRole.create({
      data: {
        user_id: user.id,
        role_id: role.id,
        chapter_id: chapter.id,
        ministry_head_id: undefined,
        cluster_id: undefined,
        assigned_by: user.id,
        is_active: true,
      },
    });
    count++;
  }

  console.log("✅ Dummy user_roles seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

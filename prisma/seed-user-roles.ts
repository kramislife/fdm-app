import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(
    "🌱 Updating user_roles with assigned_by: 1 and seeding new ones...",
  );

  const MEMBER_ROLE_ID = 11;
  const ADMIN_ID = 1;

  // 1. Update existing dummy roles to have assigned_by = 1
  const updateResult = await prisma.userRole.updateMany({
    where: {
      user: { email: { endsWith: "@fdm.org" } },
    },
    data: {
      assigned_by: ADMIN_ID,
    },
  });
  console.log(`✅ Updated ${updateResult.count} existing user_roles.`);

  // 2. Fetch chapters
  const chapters = await prisma.chapter.findMany({});
  if (chapters.length === 0) {
    console.error("❌ No chapters found. Please seed chapters first.");
    return;
  }

  // 3. Fetch users who don't have roles yet (up to 50 total)
  const usersWithoutRoles = await prisma.user.findMany({
    where: {
      user_roles: {
        none: {},
      },
      email: { endsWith: "@fdm.org" },
    },
    take: 50,
  });

  let newCount = 0;
  for (const user of usersWithoutRoles) {
    const chapter = chapters[Math.floor(Math.random() * chapters.length)];

    try {
      await prisma.$transaction([
        prisma.userRole.create({
          data: {
            user_id: user.id,
            role_id: MEMBER_ROLE_ID,
            chapter_id: chapter.id,
            assigned_by: ADMIN_ID,
            is_active: true,
          },
        }),
        prisma.userChapter.create({
          data: {
            user_id: user.id,
            chapter_id: chapter.id,
            is_primary: true,
          },
        }),
      ]);
      newCount++;
    } catch (error) {
      console.error(`❌ Failed to seed role for user ${user.id}:`, error);
    }
  }

  console.log(`✅ ${newCount} new dummy user_roles and user_chapters seeded!`);
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

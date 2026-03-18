import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";
import { USER_STATUS } from "../lib/status";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding dummy users...");

  // Fetch existing users
  const existingUsers = await prisma.user.findMany({});
  const existingEmails = new Set(existingUsers.map(u => u.email));

  // Generate 20 realistic random users
  const firstNames = [
    "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
    "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"
  ];
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"
  ];
  const dummyUsers = Array.from({ length: 50 }, (_, i) => {
    const first_name = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last_name = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${first_name.toLowerCase()}.${last_name.toLowerCase()}${i+1}@fdm.org`;
    const contact_number = `0917${String(1000000 + i).padStart(7, '0')}`;
    // Random birthday between 18 and 80 years old
    const age = Math.floor(Math.random() * (80 - 18 + 1)) + 18;
    const today = new Date();
    const birthday = new Date(today.getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    return {
      first_name,
      last_name,
      email,
      contact_number,
      birthday,
      status: USER_STATUS.ACTIVE,
    };
  });

  // Insert only if not already present
  for (const user of dummyUsers) {
    if (!existingEmails.has(user.email)) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: { birthday: user.birthday },
        create: user,
      });
    }
  }

  console.log("✅ Dummy users seeded!");
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

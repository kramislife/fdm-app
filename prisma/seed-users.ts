import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";
import { ACCOUNT_STATUS } from "../lib/status";
import crypto from "node:crypto";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Refining dummy users to match validation logic...");

  const dummyAddresses = [
    "123 Maria Clara St., Sampaloc, Manila",
    "456 Rizal Boulevard, Quezon City",
    "789 Bonifacio Street, Davao City",
    "101 Mabini Ave, Pasig City",
    "202 Roxas Blvd, Malate, Manila",
    "303 Session Road, Baguio City",
    "404 Osmeña Street, Cebu City",
    "505 Burgos St., Iloilo City",
    "606 Gen. Luna Ave, Makati",
    "707 Shaw Blvd, Mandaluyong",
    "808 Taft Avenue, Pasay City",
    "909 Aurora Blvd, Cubao, Quezon City",
    "111 Escolta St, Binondo, Manila",
    "222 Katipunan Ave, Loyola Heights",
    "333 Commonwealth Ave, Diliman",
    "444 Ortigas Center, Pasig",
    "555 BGC High Street, Taguig",
    "666 Makati Ave, Bel-Air",
    "777 Jose Abad Santos, Tondo",
    "888 Quezon Ave, Welcome Rotonda",
  ];

  const statuses = [
    ACCOUNT_STATUS.PENDING,
    ACCOUNT_STATUS.EXPIRED,
    ACCOUNT_STATUS.VERIFIED,
  ];

  // Fetch only the dummy users we seeded
  const allDummyUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { endsWith: "@fdm.org" } },
        { email: null, is_qr_only: true },
      ],
    },
    take: 50,
  });

  let updatedCount = 0;
  for (const dbUser of allDummyUsers) {
    const isQrOnly = Math.random() < 0.25; // 25% chance of being a QR-only member
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Validation rules:
    // 1. QR-Only: email=null, contact_number=null, is_qr_only=true, has member_qr
    // 2. Normal: email=required, is_qr_only=false
    // 3. Verified: has member_qr (regardless of type)

    const email = isQrOnly
      ? null
      : dbUser.email ||
        `${dbUser.first_name.toLowerCase()}.${dbUser.last_name.toLowerCase()}.${crypto.randomInt(1000, 9999)}@fdm.org`;

    // For normal members, contact is optional but let's make it 80% present
    const contact_number = isQrOnly
      ? null
      : Math.random() < 0.8
        ? dbUser.contact_number ||
          `09${Math.floor(Math.random() * 999999999)
            .toString()
            .padStart(9, "0")}`
        : null;

    // Verified users or QR-only users should have a QR code
    const member_qr =
      status === ACCOUNT_STATUS.VERIFIED || isQrOnly
        ? dbUser.member_qr || crypto.randomUUID()
        : null;

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        account_status: status,
        address:
          dummyAddresses[Math.floor(Math.random() * dummyAddresses.length)],
        email,
        contact_number,
        is_qr_only: isQrOnly,
        member_qr,
        qr_generated_at: member_qr
          ? dbUser.qr_generated_at || new Date()
          : null,
      },
    });
    updatedCount++;
  }

  console.log(
    `✅ ${updatedCount} users refined. Data matches app validation logic (Normal vs QR-only).`,
  );
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

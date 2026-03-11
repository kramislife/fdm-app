import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding FDM database...");

  // ============================================================
  // [1] ROLES
  // ============================================================
  console.log("→ Roles...");
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { key: "spiritual_director" },
      update: {},
      create: {
        key: "spiritual_director",
        name: "Spiritual Director",
        scope: "global",
      },
    }),
    prisma.role.upsert({
      where: { key: "elder" },
      update: {},
      create: { key: "elder", name: "Elder", scope: "global" },
    }),
    prisma.role.upsert({
      where: { key: "head_servant" },
      update: {},
      create: { key: "head_servant", name: "Head Servant", scope: "chapter" },
    }),
    prisma.role.upsert({
      where: { key: "asst_head_servant" },
      update: {},
      create: {
        key: "asst_head_servant",
        name: "Asst. Head Servant",
        scope: "chapter",
      },
    }),
    prisma.role.upsert({
      where: { key: "ministry_coordinator" },
      update: {},
      create: {
        key: "ministry_coordinator",
        name: "Ministry Coordinator",
        scope: "global",
      },
    }),
    prisma.role.upsert({
      where: { key: "builder" },
      update: {},
      create: { key: "builder", name: "Builder", scope: "chapter" },
    }),
    prisma.role.upsert({
      where: { key: "cluster_head" },
      update: {},
      create: { key: "cluster_head", name: "Cluster Head", scope: "chapter" },
    }),
    prisma.role.upsert({
      where: { key: "finance" },
      update: {},
      create: { key: "finance", name: "Finance", scope: "chapter" },
    }),
    prisma.role.upsert({
      where: { key: "ministry_head" },
      update: {},
      create: { key: "ministry_head", name: "Ministry Head", scope: "chapter" },
    }),
    prisma.role.upsert({
      where: { key: "member" },
      update: {},
      create: { key: "member", name: "Member", scope: "chapter" },
    }),
  ]);

  const roleMap = Object.fromEntries(
    roles.map((r: { key: string; id: number }) => [r.key, r]),
  );

  // ============================================================
  // [2] MINISTRY TYPES
  // Display names use proper casing for UI
  // ============================================================
  console.log("→ Ministry types...");
  const ministryTypes = await Promise.all([
    prisma.ministryType.upsert({
      where: { key: "music" },
      update: {},
      create: { key: "music", name: "Music Ministry" },
    }),
    prisma.ministryType.upsert({
      where: { key: "dance" },
      update: {},
      create: { key: "dance", name: "Dance Ministry" },
    }),
    prisma.ministryType.upsert({
      where: { key: "gen_services" },
      update: {},
      create: { key: "gen_services", name: "General Services Ministry" },
    }),
    prisma.ministryType.upsert({
      where: { key: "media" },
      update: {},
      create: { key: "media", name: "Media Ministry" },
    }),
    prisma.ministryType.upsert({
      where: { key: "food" },
      update: {},
      create: { key: "food", name: "Food Ministry" },
    }),
    prisma.ministryType.upsert({
      where: { key: "youth" },
      update: {},
      create: { key: "youth", name: "Youth Ministry" },
    }),
  ]);

  // ============================================================
  // [3] EVENT TYPES
  // rays_of_mercy    = monthly 2nd Sunday community gathering
  // clse             = Catholic Life in the Spirit Experience
  // biyayang_bigas   = rice outreach ministry
  // youth            = youth group events
  // special          = one-time celebrations and gatherings
  // ============================================================
  console.log("→ Event types...");
  const eventTypes = await Promise.all([
    prisma.eventType.upsert({
      where: { key: "rays_of_mercy" },
      update: {},
      create: {
        key: "rays_of_mercy",
        name: "Rays of Mercy",
        description:
          "Monthly community gathering every 2nd Sunday of the month",
      },
    }),
    prisma.eventType.upsert({
      where: { key: "clse" },
      update: {},
      create: {
        key: "clse",
        name: "Catholic Life in the Spirit Experience",
        description: "Life in the Spirit seminar and retreat experience",
      },
    }),
    prisma.eventType.upsert({
      where: { key: "biyayang_bigas" },
      update: {},
      create: {
        key: "biyayang_bigas",
        name: "Biyayang Bigas",
        description:
          "Community outreach — rice distribution for families in need",
      },
    }),
    prisma.eventType.upsert({
      where: { key: "youth" },
      update: {},
      create: {
        key: "youth",
        name: "Youth Event",
        description: "Youth group events, camps, and activities",
      },
    }),
    prisma.eventType.upsert({
      where: { key: "special" },
      update: {},
      create: {
        key: "special",
        name: "Special Event",
        description:
          "Special celebrations, anniversaries, and one-time gatherings",
      },
    }),
  ]);

  const eventTypeMap = Object.fromEntries(
    eventTypes.map((e: { key: string; id: number }) => [e.key, e]),
  );

  // ============================================================
  // [4] CHAPTERS
  // 6 chapters — Pasig is one chapter (Sta. Clara and Sta. Martha are areas)
  // Fellowship days are Monday–Saturday only
  // ============================================================
  console.log("→ Chapters...");
  const chapters = await Promise.all([
    prisma.chapter.upsert({
      where: { name: "Quezon City" },
      update: {},
      create: {
        name: "Quezon City",
        location: "Quezon City, Metro Manila",
        fellowship_day: "Saturday",
        is_active: true,
      },
    }),
    prisma.chapter.upsert({
      where: { name: "Bataan" },
      update: {},
      create: {
        name: "Bataan",
        location: "Balanga City, Bataan",
        fellowship_day: "Saturday",
        is_active: true,
      },
    }),
    prisma.chapter.upsert({
      where: { name: "Cavite" },
      update: {},
      create: {
        name: "Cavite",
        location: "Imus, Cavite",
        fellowship_day: "Friday",
        is_active: true,
      },
    }),
    prisma.chapter.upsert({
      where: { name: "Pasay" },
      update: {},
      create: {
        name: "Pasay",
        location: "Pasay City, Metro Manila",
        fellowship_day: "Thursday",
        is_active: true,
      },
    }),
    prisma.chapter.upsert({
      where: { name: "Pasig" },
      update: {},
      create: {
        name: "Pasig",
        location: "Pasig City, Metro Manila",
        fellowship_day: "Saturday",
        is_active: true,
      },
    }),
    prisma.chapter.upsert({
      where: { name: "Tala" },
      update: {},
      create: {
        name: "Tala",
        location: "Tala, Caloocan City",
        fellowship_day: "Wednesday",
        is_active: true,
      },
    }),
  ]);

  const chapterMap = Object.fromEntries(
    chapters.map((c: { name: string; id: number }) => [c.name, c]),
  );

  // ============================================================
  // [5] MINISTRIES — 6 per chapter (auto-assign all types)
  // ============================================================
  console.log("→ Ministries...");
  for (const chapter of chapters) {
    for (const ministryType of ministryTypes) {
      await prisma.ministry.upsert({
        where: {
          chapter_id_ministry_type_id: {
            chapter_id: chapter.id,
            ministry_type_id: ministryType.id,
          },
        },
        update: {},
        create: { chapter_id: chapter.id, ministry_type_id: ministryType.id },
      });
    }
  }

  // ============================================================
  // [6] AREAS
  // Pasig has Sta. Clara and Sta. Martha as areas
  // ============================================================
  console.log("→ Areas...");

  const areasData = [
    // Quezon City
    { name: "Commonwealth", chapter: "Quezon City" },
    // Bataan
    { name: "Balanga", chapter: "Bataan" },
    { name: "Mariveles", chapter: "Bataan" },
    // Cavite
    { name: "Imus", chapter: "Cavite" },
    { name: "Bacoor", chapter: "Cavite" },
    // Pasay
    { name: "Baclaran", chapter: "Pasay" },
    { name: "Malibay", chapter: "Pasay" },
    // Pasig — Sta. Clara and Sta. Martha are areas under one Pasig chapter
    { name: "Sta. Clara", chapter: "Pasig" },
    { name: "Sta. Martha", chapter: "Pasig" },
    // Tala
    { name: "Tala", chapter: "Tala" },
  ];

  const createdAreas: Record<
    string,
    { id: number; name: string; chapter_id: number }
  > = {};
  for (const area of areasData) {
    const chapterId = chapterMap[area.chapter].id;
    const created = await prisma.area.upsert({
      where: { name_chapter_id: { name: area.name, chapter_id: chapterId } },
      update: {},
      create: { name: area.name, chapter_id: chapterId },
    });
    createdAreas[`${area.chapter}-${area.name}`] = created;
  }

  // ============================================================
  // [7] CLUSTERS
  // ============================================================
  console.log("→ Clusters...");

  const clustersData = [
    {
      name: "Commonwealth Alpha",
      area: "Commonwealth",
      chapter: "Quezon City",
    },
    { name: "Commonwealth Beta", area: "Commonwealth", chapter: "Quezon City" },
    { name: "Balanga Alpha", area: "Balanga", chapter: "Bataan" },
    { name: "Balanga Beta", area: "Balanga", chapter: "Bataan" },
    { name: "Mariveles Alpha", area: "Mariveles", chapter: "Bataan" },
    { name: "Imus Alpha", area: "Imus", chapter: "Cavite" },
    { name: "Bacoor Alpha", area: "Bacoor", chapter: "Cavite" },
    { name: "Baclaran Alpha", area: "Baclaran", chapter: "Pasay" },
    { name: "Malibay Alpha", area: "Malibay", chapter: "Pasay" },
    { name: "Sta. Clara Alpha", area: "Sta. Clara", chapter: "Pasig" },
    { name: "Sta. Clara Beta", area: "Sta. Clara", chapter: "Pasig" },
    { name: "Sta. Martha Alpha", area: "Sta. Martha", chapter: "Pasig" },
    { name: "Tala Alpha", area: "Tala", chapter: "Tala" },
  ];

  const createdClusters: Record<string, { id: number }> = {};
  for (const cluster of clustersData) {
    const chapterId = chapterMap[cluster.chapter].id;
    const area = createdAreas[`${cluster.chapter}-${cluster.area}`];
    const created = await prisma.cluster.upsert({
      where: { name_chapter_id: { name: cluster.name, chapter_id: chapterId } },
      update: {},
      create: { name: cluster.name, area_id: area.id, chapter_id: chapterId },
    });
    createdClusters[cluster.name] = created;
  }

  // ============================================================
  // [8] USERS
  // ============================================================
  console.log("→ Users...");

  const usersData = [
    // Global
    {
      first_name: "Fr. Jose",
      last_name: "Reyes",
      email: "jose.reyes@fdm.org",
      contact_number: "09171000001",
    },
    {
      first_name: "Ramon",
      last_name: "Santos",
      email: "ramon.santos@fdm.org",
      contact_number: "09171000002",
    },
    // Quezon City
    {
      first_name: "Maria",
      last_name: "dela Cruz",
      email: "maria.delacruz@fdm.org",
      contact_number: "09171000003",
    },
    {
      first_name: "Jose",
      last_name: "Bautista",
      email: "jose.bautista@fdm.org",
      contact_number: "09171000004",
    },
    {
      first_name: "Ana",
      last_name: "Reyes",
      email: "ana.reyes@fdm.org",
      contact_number: "09171000005",
    },
    {
      first_name: "Carlo",
      last_name: "Mendoza",
      email: "carlo.mendoza@fdm.org",
      contact_number: "09171000006",
    },
    {
      first_name: "Liza",
      last_name: "Torres",
      email: "liza.torres@fdm.org",
      contact_number: "09171000007",
    },
    // Bataan
    {
      first_name: "Pedro",
      last_name: "Garcia",
      email: "pedro.garcia@fdm.org",
      contact_number: "09171000008",
    },
    {
      first_name: "Rosa",
      last_name: "Villanueva",
      email: "rosa.villanueva@fdm.org",
      contact_number: "09171000009",
    },
    // Cavite
    {
      first_name: "Miguel",
      last_name: "Aquino",
      email: "miguel.aquino@fdm.org",
      contact_number: "09171000010",
    },
    // Pasay
    {
      first_name: "Eduardo",
      last_name: "Flores",
      email: "eduardo.flores@fdm.org",
      contact_number: "09171000011",
    },
    // Pasig
    {
      first_name: "Roberto",
      last_name: "Castro",
      email: "roberto.castro@fdm.org",
      contact_number: "09171000012",
    },
    {
      first_name: "Gloria",
      last_name: "Ramos",
      email: "gloria.ramos@fdm.org",
      contact_number: "09171000013",
    },
    // Tala
    {
      first_name: "Francisco",
      last_name: "Morales",
      email: "francisco.morales@fdm.org",
      contact_number: "09171000014",
    },
    // QC members
    {
      first_name: "Juan",
      last_name: "Dela Rosa",
      email: "juan.delarosa@fdm.org",
      contact_number: "09171000015",
    },
    {
      first_name: "Nena",
      last_name: "Aguilar",
      email: "nena.aguilar@fdm.org",
      contact_number: "09171000016",
    },
    {
      first_name: "Rodel",
      last_name: "Diaz",
      email: "rodel.diaz@fdm.org",
      contact_number: "09171000017",
    },
  ];

  const createdUsers: Record<string, { id: number }> = {};
  for (const user of usersData) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        contact_number: user.contact_number,
        status: "active",
      },
    });
    createdUsers[user.email] = created;
  }

  const sd = createdUsers["jose.reyes@fdm.org"];
  const elder = createdUsers["ramon.santos@fdm.org"];
  const qcHS = createdUsers["maria.delacruz@fdm.org"];
  const qcAHS = createdUsers["jose.bautista@fdm.org"];
  const qcFinance = createdUsers["ana.reyes@fdm.org"];
  const qcBuilder = createdUsers["carlo.mendoza@fdm.org"];
  const qcCH = createdUsers["liza.torres@fdm.org"];
  const batHS = createdUsers["pedro.garcia@fdm.org"];
  const batBuilder = createdUsers["rosa.villanueva@fdm.org"];
  const cavHS = createdUsers["miguel.aquino@fdm.org"];
  const pasayHS = createdUsers["eduardo.flores@fdm.org"];
  const pasigHS = createdUsers["roberto.castro@fdm.org"];
  const pasigAHS = createdUsers["gloria.ramos@fdm.org"];
  const talaHS = createdUsers["francisco.morales@fdm.org"];
  const member1 = createdUsers["juan.delarosa@fdm.org"];
  const member2 = createdUsers["nena.aguilar@fdm.org"];
  const member3 = createdUsers["rodel.diaz@fdm.org"];

  // ============================================================
  // [9] USER CHAPTERS
  // ============================================================
  console.log("→ User chapters...");

  const userChapterAssignments: { user: { id: number }; chapter: string }[] = [
    { user: sd, chapter: "Quezon City" },
    { user: elder, chapter: "Quezon City" },
    { user: qcHS, chapter: "Quezon City" },
    { user: qcAHS, chapter: "Quezon City" },
    { user: qcFinance, chapter: "Quezon City" },
    { user: qcBuilder, chapter: "Quezon City" },
    { user: qcCH, chapter: "Quezon City" },
    { user: member1, chapter: "Quezon City" },
    { user: member2, chapter: "Quezon City" },
    { user: member3, chapter: "Quezon City" },
    { user: batHS, chapter: "Bataan" },
    { user: batBuilder, chapter: "Bataan" },
    { user: cavHS, chapter: "Cavite" },
    { user: pasayHS, chapter: "Pasay" },
    { user: pasigHS, chapter: "Pasig" },
    { user: pasigAHS, chapter: "Pasig" },
    { user: talaHS, chapter: "Tala" },
  ];

  for (const a of userChapterAssignments) {
    await prisma.userChapter.upsert({
      where: {
        user_id_chapter_id: {
          user_id: a.user.id,
          chapter_id: chapterMap[a.chapter].id,
        },
      },
      update: {},
      create: {
        user_id: a.user.id,
        chapter_id: chapterMap[a.chapter].id,
        is_primary: true,
      },
    });
  }

  // ============================================================
  // [10] USER ROLES
  // ============================================================
  console.log("→ User roles...");

  const userRoleAssignments: {
    user: { id: number };
    role: string;
    chapter_id: number | undefined;
    cluster_id: number | undefined;
  }[] = [
    {
      user: sd,
      role: "spiritual_director",
      chapter_id: undefined,
      cluster_id: undefined,
    },
    {
      user: elder,
      role: "elder",
      chapter_id: undefined,
      cluster_id: undefined,
    },
    {
      user: qcHS,
      role: "head_servant",
      chapter_id: chapterMap["Quezon City"].id,
      cluster_id: undefined,
    },
    {
      user: qcAHS,
      role: "asst_head_servant",
      chapter_id: chapterMap["Quezon City"].id,
      cluster_id: undefined,
    },
    {
      user: qcFinance,
      role: "finance",
      chapter_id: chapterMap["Quezon City"].id,
      cluster_id: undefined,
    },
    {
      user: qcBuilder,
      role: "builder",
      chapter_id: chapterMap["Quezon City"].id,
      cluster_id: createdClusters["Commonwealth Alpha"].id,
    },
    {
      user: qcCH,
      role: "cluster_head",
      chapter_id: chapterMap["Quezon City"].id,
      cluster_id: createdClusters["Commonwealth Alpha"].id,
    },
    {
      user: member1,
      role: "member",
      chapter_id: chapterMap["Quezon City"].id,
      cluster_id: undefined,
    },
    {
      user: member2,
      role: "member",
      chapter_id: chapterMap["Quezon City"].id,
      cluster_id: undefined,
    },
    {
      user: member3,
      role: "member",
      chapter_id: chapterMap["Quezon City"].id,
      cluster_id: undefined,
    },
    {
      user: batHS,
      role: "head_servant",
      chapter_id: chapterMap["Bataan"].id,
      cluster_id: undefined,
    },
    {
      user: batBuilder,
      role: "builder",
      chapter_id: chapterMap["Bataan"].id,
      cluster_id: createdClusters["Balanga Alpha"].id,
    },
    {
      user: cavHS,
      role: "head_servant",
      chapter_id: chapterMap["Cavite"].id,
      cluster_id: undefined,
    },
    {
      user: pasayHS,
      role: "head_servant",
      chapter_id: chapterMap["Pasay"].id,
      cluster_id: undefined,
    },
    {
      user: pasigHS,
      role: "head_servant",
      chapter_id: chapterMap["Pasig"].id,
      cluster_id: undefined,
    },
    {
      user: pasigAHS,
      role: "asst_head_servant",
      chapter_id: chapterMap["Pasig"].id,
      cluster_id: undefined,
    },
    {
      user: talaHS,
      role: "head_servant",
      chapter_id: chapterMap["Tala"].id,
      cluster_id: undefined,
    },
  ];

  for (const a of userRoleAssignments) {
    await prisma.userRole.upsert({
      where: {
        user_id_role_id_chapter_id_ministry_id_cluster_id: {
          user_id: a.user.id,
          role_id: roleMap[a.role].id,
          chapter_id: a.chapter_id ?? 0,
          ministry_id: 0,
          cluster_id: a.cluster_id ?? 0,
        },
      },
      update: {},
      create: {
        user_id: a.user.id,
        role_id: roleMap[a.role].id,
        chapter_id: a.chapter_id,
        ministry_id: undefined,
        cluster_id: a.cluster_id,
        assigned_by: sd.id,
        is_active: true,
      },
    });
  }

  // ============================================================
  // [11] CLUSTER MEMBERS
  // ============================================================
  console.log("→ Cluster members...");

  const clusterMemberData: {
    user: { id: number };
    cluster: string;
    household_name: string;
    address: string;
  }[] = [
    {
      user: member1,
      cluster: "Commonwealth Alpha",
      household_name: "Dela Rosa Family",
      address: "123 Commonwealth Ave, QC",
    },
    {
      user: member2,
      cluster: "Commonwealth Alpha",
      household_name: "Aguilar Family",
      address: "45 Litex Road, QC",
    },
    {
      user: member3,
      cluster: "Commonwealth Alpha",
      household_name: "Diaz Family",
      address: "78 Fairview St, QC",
    },
    {
      user: qcCH,
      cluster: "Commonwealth Alpha",
      household_name: "Torres Family",
      address: "10 Commonwealth Ext, QC",
    },
  ];

  for (const cm of clusterMemberData) {
    await prisma.clusterMember.upsert({
      where: {
        user_id_cluster_id: {
          user_id: cm.user.id,
          cluster_id: createdClusters[cm.cluster].id,
        },
      },
      update: {},
      create: {
        user_id: cm.user.id,
        cluster_id: createdClusters[cm.cluster].id,
        household_name: cm.household_name,
        address: cm.address,
      },
    });
  }

  // ============================================================
  // [12] EVENTS
  // Rays of Mercy = community-wide, every 2nd Sunday
  // Believers Fellowship = chapter-level, Mon–Sat
  // ============================================================
  console.log("→ Events...");

  // Rays of Mercy — community-wide, every 2nd Sunday
  const event1 = await prisma.event.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Rays of Mercy — Manila March 2026",
      chapter_id: undefined,
      event_type_id: eventTypeMap["rays_of_mercy"].id,
      event_date: new Date("2026-03-08"),
      event_time: new Date("1970-01-01T09:00:00"),
      is_raffle_event: true,
      created_by: sd.id,
    },
  });

  // Rays of Mercy — chapter-level (QC hosted)
  const event2 = await prisma.event.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Rays of Mercy — February 2026",
      chapter_id: undefined,
      event_type_id: eventTypeMap["rays_of_mercy"].id,
      event_date: new Date("2026-02-08"),
      event_time: new Date("1970-01-01T09:00:00"),
      is_raffle_event: false,
      created_by: sd.id,
    },
  });

  // CLSE — hosted by QC chapter
  const event3 = await prisma.event.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "Catholic Life in the Spirit Experience — QC 2026",
      chapter_id: chapterMap["Quezon City"].id,
      event_type_id: eventTypeMap["clse"].id,
      event_date: new Date("2026-02-21"),
      event_time: new Date("1970-01-01T08:00:00"),
      is_raffle_event: false,
      created_by: qcHS.id,
    },
  });

  // Biyayang Bigas — Bataan outreach
  const event4 = await prisma.event.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: "Biyayang Bigas — Bataan Outreach",
      chapter_id: chapterMap["Bataan"].id,
      event_type_id: eventTypeMap["biyayang_bigas"].id,
      event_date: new Date("2026-03-01"),
      event_time: new Date("1970-01-01T07:00:00"),
      is_raffle_event: false,
      created_by: batHS.id,
    },
  });

  // Special — FDM Anniversary
  const event5 = await prisma.event.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: "FDM Community Anniversary Celebration",
      chapter_id: undefined,
      event_type_id: eventTypeMap["special"].id,
      event_date: new Date("2026-04-05"),
      event_time: new Date("1970-01-01T10:00:00"),
      is_raffle_event: false,
      created_by: sd.id,
    },
  });

  // ============================================================
  // [13] ATTENDANCE
  // ============================================================
  console.log("→ Attendance...");

  const attendanceData: {
    user: { id: number };
    event: { id: number };
    method: string;
  }[] = [
    { user: qcHS, event: event1, method: "scanned" },
    { user: qcAHS, event: event1, method: "scanned" },
    { user: member1, event: event1, method: "scanned" },
    { user: member2, event: event1, method: "self_checkin" },
    { user: member3, event: event1, method: "scanned" },
    { user: batHS, event: event1, method: "scanned" },
    { user: pasigHS, event: event1, method: "scanned" },
    { user: qcHS, event: event2, method: "scanned" },
    { user: member1, event: event2, method: "scanned" },
    { user: member2, event: event2, method: "scanned" },
    { user: batHS, event: event3, method: "scanned" },
    { user: batBuilder, event: event3, method: "scanned" },
    { user: pasigHS, event: event4, method: "scanned" },
    { user: pasigAHS, event: event4, method: "scanned" },
  ];

  for (const a of attendanceData) {
    await prisma.attendance.upsert({
      where: { user_id_event_id: { user_id: a.user.id, event_id: a.event.id } },
      update: {},
      create: { user_id: a.user.id, event_id: a.event.id, method: a.method },
    });
  }

  // ============================================================
  // [14] GUEST LOGS
  // ============================================================
  console.log("→ Guest logs...");

  const guestAtt1 = await prisma.attendance.create({
    data: { event_id: event1.id, method: "encoded" },
  });

  const guestAtt2 = await prisma.attendance.create({
    data: { event_id: event2.id, method: "encoded" },
  });

  await prisma.guestLog.createMany({
    data: [
      {
        first_name: "Mark",
        last_name: "Fernandez",
        email: "mark.fernandez@gmail.com",
        contact_number: "09281000001",
        chapter_id: chapterMap["Quezon City"].id,
        encoded_by: qcAHS.id,
        event_id: event1.id,
        attendance_id: guestAtt1.id,
        follow_up_status: "pending",
      },
      {
        first_name: "Sandra",
        last_name: "Lopez",
        email: "sandra.lopez@gmail.com",
        contact_number: "09281000002",
        chapter_id: chapterMap["Quezon City"].id,
        encoded_by: qcAHS.id,
        event_id: event2.id,
        attendance_id: guestAtt2.id,
        follow_up_status: "emailed",
      },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // [15] ENTHRONEMENT RECORDS
  // ============================================================
  console.log("→ Enthronement records...");

  await prisma.enthronementRecord.createMany({
    data: [
      {
        cluster_id: createdClusters["Commonwealth Alpha"].id,
        household_name: "Dela Rosa Family",
        address: "123 Commonwealth Ave, QC",
        contact_member_id: member1.id,
        enthroned_at: new Date("2026-02-14T10:00:00"),
        enthroned_by: qcCH.id,
        has_divine_mercy_image: true,
        donation_amount: 500.0,
        notes: "Very welcoming family. Image passed from Reyes family.",
        recorded_by: qcBuilder.id,
      },
      {
        cluster_id: createdClusters["Commonwealth Alpha"].id,
        household_name: "Aguilar Family",
        address: "45 Litex Road, QC",
        contact_member_id: member2.id,
        enthroned_at: new Date("2026-02-28T14:00:00"),
        enthroned_by: qcCH.id,
        has_divine_mercy_image: false,
        donation_amount: 200.0,
        notes: "Family received the image from Dela Rosa family.",
        recorded_by: qcBuilder.id,
      },
      {
        cluster_id: createdClusters["Balanga Alpha"].id,
        household_name: "Garcia Family",
        address: "22 Rizal St, Balanga, Bataan",
        contact_member_id: batHS.id,
        enthroned_at: new Date("2026-03-01T09:00:00"),
        enthroned_by: batBuilder.id,
        has_divine_mercy_image: true,
        recorded_by: batBuilder.id,
      },
      {
        cluster_id: createdClusters["Sta. Clara Alpha"].id,
        household_name: "Castro Family",
        address: "5 Sta. Clara St, Pasig City",
        contact_member_id: pasigAHS.id,
        enthroned_at: new Date("2026-03-05T10:00:00"),
        enthroned_by: pasigHS.id,
        has_divine_mercy_image: true,
        donation_amount: 300.0,
        notes: "First enthronement in Sta. Clara area.",
        recorded_by: pasigHS.id,
      },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // [16] FINANCE RECORDS
  // ============================================================
  console.log("→ Finance records...");

  await prisma.financeRecord.createMany({
    data: [
      {
        chapter_id: chapterMap["Quezon City"].id,
        recorded_by: qcFinance.id,
        type: "income",
        amount: 15000.0,
        description: "Love offering — Rays of Mercy March 2026",
        transaction_date: new Date("2026-03-08"),
      },
      {
        chapter_id: chapterMap["Quezon City"].id,
        recorded_by: qcFinance.id,
        type: "expense",
        amount: 3500.0,
        description: "Venue rental — Rays of Mercy March 2026",
        transaction_date: new Date("2026-03-08"),
      },
      {
        chapter_id: chapterMap["Quezon City"].id,
        recorded_by: qcFinance.id,
        type: "expense",
        amount: 2200.0,
        description: "Sound system and equipment",
        transaction_date: new Date("2026-03-07"),
      },
      {
        chapter_id: chapterMap["Bataan"].id,
        recorded_by: batHS.id,
        type: "income",
        amount: 8000.0,
        description: "Love offering — Rays of Mercy March 2026",
        transaction_date: new Date("2026-03-08"),
      },
      {
        chapter_id: chapterMap["Cavite"].id,
        recorded_by: cavHS.id,
        type: "income",
        amount: 6500.0,
        description: "Love offering — Believers Fellowship March 2026",
        transaction_date: new Date("2026-03-07"),
      },
      {
        chapter_id: chapterMap["Pasig"].id,
        recorded_by: pasigHS.id,
        type: "income",
        amount: 9000.0,
        description: "Love offering — Rays of Mercy March 2026",
        transaction_date: new Date("2026-03-08"),
      },
      {
        chapter_id: chapterMap["Tala"].id,
        recorded_by: talaHS.id,
        type: "income",
        amount: 5500.0,
        description: "Love offering — Rays of Mercy March 2026",
        transaction_date: new Date("2026-03-08"),
      },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // [17] ANNOUNCEMENTS
  // ============================================================
  console.log("→ Announcements...");

  await prisma.announcement.createMany({
    data: [
      {
        title: "Rays of Mercy — March 2026",
        content:
          "Join us for this month's Rays of Mercy on March 8, 2026 at 9:00 AM. All chapters are invited. Raffle draw at 12:00 PM.",
        posted_by: sd.id,
        chapter_id: undefined,
        type: "event",
        is_published: true,
        published_at: new Date("2026-03-01"),
      },
      {
        title: "QC Believers Fellowship — March 7",
        content:
          "This Saturday, March 7 at 3:00 PM. All QC members please be on time. Worship and fellowship night.",
        posted_by: qcHS.id,
        chapter_id: chapterMap["Quezon City"].id,
        type: "announcement",
        is_published: true,
        published_at: new Date("2026-03-05"),
      },
      {
        title: "Pasig Chapter Update",
        content:
          "Sta. Clara and Sta. Martha areas will hold a joint cluster meeting this coming Saturday. All cluster heads and builders please attend.",
        posted_by: pasigHS.id,
        chapter_id: chapterMap["Pasig"].id,
        type: "announcement",
        is_published: true,
        published_at: new Date("2026-03-04"),
      },
      {
        title: "Welcome New Members — March 2026",
        content:
          "Please welcome our new members who joined this month across all chapters. May they find a home in our community.",
        posted_by: sd.id,
        chapter_id: undefined,
        type: "announcement",
        is_published: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding complete!");
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

/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const agencyPasswordHash = await bcrypt.hash("agency-demo-password", 10);

  const agencyUser = await prisma.user.upsert({
    where: { email: "agency@example.com" },
    update: {},
    create: {
      email: "agency@example.com",
      passwordHash: agencyPasswordHash,
      name: "Demo Agency",
    },
  });

  /** Studio personas: Issy (ops), Harriet (design & owner), May (social). Passwords set per team onboarding. */
  const teamSeed = [
    {
      email: "isabella@collectivstudio.uk",
      personaSlug: "isabella",
      jobTitle: "Operations — project flow, calendar, assigning, client comms",
      name: "Isabella",
      welcomeName: "Issy",
      password: "CsTmp-Issy-7mN!",
    },
    {
      email: "harriet@collectivstudio.uk",
      personaSlug: "harriet",
      jobTitle: "Designer & business owner",
      name: "Harriet",
      welcomeName: null,
      password: "CsTmp-Harriet-9kL!",
    },
    {
      email: "zbyszka@collectivstudio.uk",
      personaSlug: "may",
      jobTitle: "Social media — client comms, processes & calendar sign-off",
      name: "May",
      welcomeName: null,
      password: "CsTmp-May-4pQ!",
    },
  ];

  await prisma.agencyTodo.deleteMany({ where: { kind: "DEMO_SEED" } });

  const emailsToKeep = new Set(
    [
      "agency@example.com",
      ...teamSeed.map((t) => t.email.toLowerCase()),
      ...(process.env.STUDIO_EMAIL ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ].filter(Boolean),
  );

  await prisma.project.deleteMany({ where: { userId: null } });
  await prisma.project.deleteMany({ where: { userId: agencyUser.id } });
  await prisma.user.deleteMany({
    where: { NOT: { email: { in: Array.from(emailsToKeep) } } },
  });

  for (const t of teamSeed) {
    const teamPasswordHash = await bcrypt.hash(t.password, 10);
    const u = await prisma.user.upsert({
      where: { email: t.email },
      update: { name: t.name, passwordHash: teamPasswordHash },
      create: {
        email: t.email,
        passwordHash: teamPasswordHash,
        name: t.name,
      },
    });
    await prisma.studioTeamMember.upsert({
      where: { userId: u.id },
      create: {
        userId: u.id,
        personaSlug: t.personaSlug,
        jobTitle: t.jobTitle,
        welcomeName: t.welcomeName ?? undefined,
        availabilityNote: "",
      },
      update: {
        personaSlug: t.personaSlug,
        jobTitle: t.jobTitle,
        ...(t.welcomeName != null ? { welcomeName: t.welcomeName } : {}),
      },
    });
  }

  const harrietUser = await prisma.user.findUnique({ where: { email: "harriet@collectivstudio.uk" } });
  if (harrietUser) {
    await prisma.studioTeamMember
      .update({
        where: { userId: harrietUser.id },
        data: {
          welcomeName: "Harriet",
          photoUrl: "/images/team-harriet.png",
          availabilityNote: "Mon–Thu 9–5 · Fri AM · OOO noted in portal",
        },
      })
      .catch(() => {});
  }

  const isabellaUser = await prisma.user.findUnique({ where: { email: "isabella@collectivstudio.uk" } });
  if (isabellaUser) {
    await prisma.studioTeamMember
      .update({
        where: { userId: isabellaUser.id },
        data: {
          photoUrl: "/images/team-isabella.png",
        },
      })
      .catch(() => {});
  }

  const mayUser = await prisma.user.findUnique({ where: { email: "zbyszka@collectivstudio.uk" } });
  if (mayUser) {
    await prisma.studioTeamMember
      .update({
        where: { userId: mayUser.id },
        data: {
          welcomeName: "May",
          photoUrl: "/images/team-may.png",
        },
      })
      .catch(() => {});
  }

  const studioEmailList = (process.env.STUDIO_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const firstStudioEmail = studioEmailList[0];
  if (firstStudioEmail) {
    const existing = await prisma.user.findUnique({ where: { email: firstStudioEmail } });
    if (!existing) {
      const studioHash = await bcrypt.hash("studio-password-change-me", 10);
      await prisma.user.create({
        data: {
          email: firstStudioEmail,
          passwordHash: studioHash,
          name: "Collectiv Studio",
        },
      });
      // eslint-disable-next-line no-console
      console.log(
        `Created env-only studio user (first STUDIO_EMAIL, not in team seed): ${firstStudioEmail} / studio-password-change-me`,
      );
    }
  }

  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("Seed OK — studio team + demo agency (no demo client projects).");
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("  Agency (broad studio access — add to STUDIO_EMAIL if you use this account):");
  // eslint-disable-next-line no-console
  console.log("    Email:    agency@example.com");
  // eslint-disable-next-line no-console
  console.log("    Password: agency-demo-password");
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("  Named studio team (add these emails to STUDIO_EMAIL in .env / Vercel):");
  for (const t of teamSeed) {
    // eslint-disable-next-line no-console
    console.log(`    ${t.email}  /  ${t.password}  (${t.welcomeName ?? t.name})`);
  }
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("  Also set persona env vars so dashboards map correctly:");
  // eslint-disable-next-line no-console
  console.log("    STUDIO_PERSONA_ISABELLA_EMAIL=isabella@collectivstudio.uk");
  // eslint-disable-next-line no-console
  console.log("    STUDIO_PERSONA_HARRIET_EMAIL=harriet@collectivstudio.uk");
  // eslint-disable-next-line no-console
  console.log("    STUDIO_PERSONA_MAY_EMAIL=zbyszka@collectivstudio.uk");
  // eslint-disable-next-line no-console
  console.log("");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

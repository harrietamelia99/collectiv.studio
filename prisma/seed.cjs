/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs/promises");
const path = require("path");

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

  /** Studio personas: Issy (ops), Harriet (design & owner), May (social — flow overseen by Issy). */
  const teamSeed = [
    {
      email: "isabella@collectiv.local",
      personaSlug: "isabella",
      jobTitle: "Operations — project flow, calendar, assigning, client comms",
      name: "Isabella",
      welcomeName: "Issy",
      testPassword: "collectiv-test-issy",
    },
    {
      email: "harriet@collectiv.local",
      personaSlug: "harriet",
      jobTitle: "Designer & business owner",
      name: "Harriet",
      welcomeName: null,
      testPassword: "collectiv-test-harriet",
    },
    {
      email: "may@collectiv.local",
      personaSlug: "may",
      jobTitle: "Social media — client comms, processes & calendar sign-off",
      name: "May",
      welcomeName: null,
      testPassword: "collectiv-test-may",
    },
  ];
  for (const t of teamSeed) {
    const teamPasswordHash = await bcrypt.hash(t.testPassword, 10);
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

  /** Remove legacy demo markers; strip test clients/projects so only studio + Riverside walkthrough remain. */
  await prisma.agencyTodo.deleteMany({ where: { kind: "DEMO_SEED" } });

  const riversideClientEmail = "client-walkthrough@collectiv.local";
  const emailsToKeep = new Set(
    [
      "agency@example.com",
      riversideClientEmail,
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

  function atNoonDaysFromNow(days) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + days);
    return d;
  }

  async function ensureCalendarPostsByTitle(projectId, definitions) {
    const existing = await prisma.contentCalendarItem.findMany({
      where: { projectId },
      select: { title: true },
    });
    const have = new Set(existing.map((e) => e.title).filter(Boolean));
    const data = [];
    for (const def of definitions) {
      if (have.has(def.title)) continue;
      data.push({
        projectId,
        title: def.title,
        caption: def.caption,
        scheduledFor: def.daysFromNow === null ? null : atNoonDaysFromNow(def.daysFromNow),
        clientSignedOff: Boolean(def.clientSignedOff),
        signedOffAt: def.clientSignedOff ? new Date() : null,
      });
    }
    if (data.length) await prisma.contentCalendarItem.createMany({ data });
  }

  /** Copy bundled demo stills into `uploads/{projectId}/` and point matching calendar rows at them (re-runnable). */
  async function syncDemoCalendarPostImages(projectId, titleToFile) {
    const uploadsRoot = path.join(process.cwd(), "uploads");
    const assetsDir = path.join(__dirname, "assets");
    const uniqueFiles = [...new Set(Object.values(titleToFile))];
    for (const fileName of uniqueFiles) {
      const src = path.join(assetsDir, fileName);
      let buf;
      try {
        buf = await fs.readFile(src);
      } catch (e) {
        console.warn(`Calendar demo asset missing (${fileName}):`, e?.message ?? e);
        continue;
      }
      const destDir = path.join(uploadsRoot, projectId);
      await fs.mkdir(destDir, { recursive: true });
      await fs.writeFile(path.join(destDir, fileName), buf);
    }
    for (const [title, fileName] of Object.entries(titleToFile)) {
      const rel = `${projectId}/${fileName}`;
      await prisma.contentCalendarItem.updateMany({
        where: { projectId, title },
        data: { imagePath: rel },
      });
    }
  }

  async function ensureReviewAssets(projectId, definitions) {
    for (const def of definitions) {
      const exists = await prisma.reviewAsset.findFirst({
        where: { projectId, kind: def.kind, title: def.title },
      });
      if (!exists) {
        await prisma.reviewAsset.create({
          data: {
            projectId,
            kind: def.kind,
            title: def.title,
            notes: def.notes ?? null,
            filePath: null,
          },
        });
      }
    }
  }

  /**
   * Riverside Studio walkthrough — website, social, branding-only, and signage-only subscriptions.
   */
  const walkthroughPassword = await bcrypt.hash("collectiv-walkthrough", 10);
  const walkthroughClient = await prisma.user.upsert({
    where: { email: riversideClientEmail },
    update: {
      passwordHash: walkthroughPassword,
      name: "Alex Morgan",
      businessName: "Riverside Studio",
    },
    create: {
      email: "client-walkthrough@collectiv.local",
      passwordHash: walkthroughPassword,
      name: "Alex Morgan",
      businessName: "Riverside Studio",
    },
  });

  const harrietForWalkthrough = await prisma.user.findUnique({
    where: { email: "harriet@collectiv.local" },
    select: { id: true },
  });

  const mayForWalkthrough = await prisma.user.findUnique({
    where: { email: "may@collectiv.local" },
    select: { id: true },
  });

  await prisma.project.deleteMany({
    where: {
      userId: walkthroughClient.id,
      name: "Website & social — Riverside Studio",
    },
  });

  const walkthroughWebName = "Riverside Studio — Website";
  const walkthroughSocialName = "Riverside Studio — Social";
  const walkthroughBrandingName = "Riverside Studio — Branding";
  const walkthroughSignageName = "Riverside Studio — Signage";
  const walkthroughSharedBase = {
    clientVerifiedAt: new Date(),
    assignedStudioUserId: harrietForWalkthrough?.id ?? null,
    invitedClientEmail: null,
  };
  const walkthroughWebShared = {
    ...walkthroughSharedBase,
    discoveryApprovedAt: new Date(),
    websitePageCount: 4,
    websitePageLabels: JSON.stringify(["Home", "About", "Shop", "Contact"]),
    websiteKitSignedOff: false,
    websitePrimaryHex: null,
    websiteSecondaryHex: null,
    websiteAccentHex: null,
    websiteQuaternaryHex: null,
    websiteFontPaths: "[]",
    websiteLogoPath: null,
    websiteLogoVariationsJson: "[]",
  };
  const walkthroughSocialShared = {
    ...walkthroughSharedBase,
    discoveryApprovedAt: null,
    /** Riverside social subscription — May only (no fallback; re-run seed after creating May’s login). */
    assignedStudioUserId: mayForWalkthrough?.id ?? null,
  };
  const walkthroughBrandingShared = {
    ...walkthroughSharedBase,
    discoveryApprovedAt: null,
    inspirationLinksJson: JSON.stringify([
      {
        url: "https://www.pinterest.com/search/pins/?q=minimal%20brand%20identity",
        label: "Minimal brand mood",
        kind: "pinterest",
      },
    ]),
  };
  const walkthroughSignageShared = {
    ...walkthroughSharedBase,
    discoveryApprovedAt: null,
    inspirationLinksJson: "[]",
  };

  let walkthroughWeb = await prisma.project.findFirst({
    where: {
      userId: walkthroughClient.id,
      OR: [{ name: walkthroughWebName }, { name: "Website — Riverside Studio" }],
    },
  });
  const walkthroughWebData = {
    name: walkthroughWebName,
    portalKind: "WEBSITE",
    ...walkthroughWebShared,
  };
  if (!walkthroughWeb) {
    walkthroughWeb = await prisma.project.create({
      data: {
        userId: walkthroughClient.id,
        name: walkthroughWebName,
        portalKind: "WEBSITE",
        ...walkthroughWebShared,
      },
    });
  } else {
    await prisma.project.update({
      where: { id: walkthroughWeb.id },
      data: walkthroughWebData,
    });
  }

  for (let i = 0; i < 4; i++) {
    await prisma.websitePageBrief.upsert({
      where: { projectId_pageIndex: { projectId: walkthroughWeb.id, pageIndex: i } },
      create: { projectId: walkthroughWeb.id, pageIndex: i },
      update: {},
    });
  }

  let walkthroughSocial = await prisma.project.findFirst({
    where: { userId: walkthroughClient.id, name: walkthroughSocialName },
  });
  const walkthroughSocialData = {
    portalKind: "SOCIAL",
    ...walkthroughSocialShared,
  };
  if (!walkthroughSocial) {
    walkthroughSocial = await prisma.project.create({
      data: {
        userId: walkthroughClient.id,
        name: walkthroughSocialName,
        portalKind: "SOCIAL",
        ...walkthroughSocialShared,
      },
    });
  } else {
    await prisma.project.update({
      where: { id: walkthroughSocial.id },
      data: walkthroughSocialData,
    });
  }

  let walkthroughBranding = await prisma.project.findFirst({
    where: { userId: walkthroughClient.id, name: walkthroughBrandingName },
  });
  const walkthroughBrandingData = {
    name: walkthroughBrandingName,
    portalKind: "BRANDING",
    ...walkthroughBrandingShared,
  };
  if (!walkthroughBranding) {
    walkthroughBranding = await prisma.project.create({
      data: {
        userId: walkthroughClient.id,
        name: walkthroughBrandingName,
        portalKind: "BRANDING",
        ...walkthroughBrandingShared,
      },
    });
  } else {
    await prisma.project.update({
      where: { id: walkthroughBranding.id },
      data: walkthroughBrandingData,
    });
  }

  let walkthroughSignage = await prisma.project.findFirst({
    where: { userId: walkthroughClient.id, name: walkthroughSignageName },
  });
  const walkthroughSignageData = {
    name: walkthroughSignageName,
    portalKind: "SIGNAGE",
    ...walkthroughSignageShared,
  };
  if (!walkthroughSignage) {
    walkthroughSignage = await prisma.project.create({
      data: {
        userId: walkthroughClient.id,
        name: walkthroughSignageName,
        portalKind: "SIGNAGE",
        ...walkthroughSignageShared,
      },
    });
  } else {
    await prisma.project.update({
      where: { id: walkthroughSignage.id },
      data: walkthroughSignageData,
    });
  }

  /** Drop any other rows for this demo client (legacy ONE_OFF “branding & signage”, renames, duplicates). */
  await prisma.project.deleteMany({
    where: {
      userId: walkthroughClient.id,
      NOT: {
        id: {
          in: [walkthroughWeb.id, walkthroughSocial.id, walkthroughBranding.id, walkthroughSignage.id],
        },
      },
    },
  });

  try {
    const logoSrc = path.join(__dirname, "assets", "riverside-demo-logo.svg");
    const logoBuf = await fs.readFile(logoSrc);
    const uploadsRoot = path.join(process.cwd(), "uploads");
    const logoFileName = "riverside-demo-logo.svg";
    for (const walkthroughProject of [walkthroughWeb, walkthroughSocial, walkthroughBranding, walkthroughSignage]) {
      const destDir = path.join(uploadsRoot, walkthroughProject.id);
      await fs.mkdir(destDir, { recursive: true });
      const destFile = path.join(destDir, logoFileName);
      await fs.writeFile(destFile, logoBuf);
      const rel = `${walkthroughProject.id}/${logoFileName}`;
      await prisma.project.update({
        where: { id: walkthroughProject.id },
        data: { websiteLogoPath: rel },
      });
    }
  } catch (e) {
    console.warn("Could not install Riverside demo logo (walkthrough projects):", e?.message ?? e);
  }

  /** Agency-authored calendar previews: 14 posts, 2 pre–signed off (matches client hub “Calendar & sign-off”). */
  await ensureCalendarPostsByTitle(walkthroughSocial.id, [
    {
      title: "March highlight",
      caption:
        "A calm, editorial frame for your next launch — copy ready for your sign-off.\n\nSave for later ✦ Quiet luxury energy",
      daysFromNow: 2,
    },
    {
      title: "Behind the scenes",
      caption:
        "Short caption option B — swap imagery once your shoot is ready.\n\n#BTS #StudioLife",
      daysFromNow: 9,
      clientSignedOff: true,
    },
    {
      title: "Launch week — hero still",
      caption:
        "This week we go live. Here’s the hero frame: soft light, single focal product, your brand colour as the only accent.\n\nTap to see the full grid story →",
      daysFromNow: 1,
    },
    {
      title: "Launch week — detail crop",
      caption:
        "Pair post: texture and detail. Same day as the hero — reads as a mini-series in the feed.",
      daysFromNow: 1,
    },
    {
      title: "Founder Friday — quote card",
      caption:
        "“We didn’t need louder — we needed clearer.”\n\n— You, probably.\n\nQuote cards break the grid and drive saves.",
      daysFromNow: 4,
      clientSignedOff: true,
    },
    {
      title: "Carousel — 5-slide brand story",
      caption:
        "Slide 1: Hook\nSlide 2: Problem\nSlide 3: Your approach\nSlide 4: Proof\nSlide 5: CTA\n\nSwipe for the full narrative.",
      daysFromNow: 6,
    },
    {
      title: "Reels cover — 15s process",
      caption:
        "15s: peel back, pour, pack — ASMR-style process with on-screen captions. Sound: soft ambient.",
      daysFromNow: 8,
    },
    {
      title: "Educational — 3 myths",
      caption:
        "Myth 1: More posts = more growth.\nMyth 2: Trends beat consistency.\nMyth 3: You need a viral hit.\n\nTruth: clarity + cadence wins.",
      daysFromNow: 11,
    },
    {
      title: "UGC reshare — client love",
      caption:
        "When your community shows up like this, we reshare with a thank-you line and branded border. Pending your OK on the crop.",
      daysFromNow: 14,
    },
    {
      title: "Weekend mood — single line",
      caption: "Slow Sunday. Same standards.\n\n🤍",
      daysFromNow: 16,
    },
    {
      title: "Mid-month check-in",
      caption:
        "Halfway through the month — here’s what’s performing and what we’re nudging for the back half. Reply with any date swaps.",
      daysFromNow: 18,
    },
    {
      title: "Product flatlay — feed still",
      caption:
        "Overhead flatlay: hero SKU + props in your secondary palette. Caption keeps the CTA soft (link in bio).",
      daysFromNow: 21,
    },
    {
      title: "Stories sequence — polls",
      caption:
        "Story 1: This or that?\nStory 2: Poll results\nStory 3: Tease next week’s drop\n\n(Sequence not scheduled to fixed days yet — see below.)",
      daysFromNow: null,
    },
    {
      title: "Press snippet — optional",
      caption:
        "If coverage lands this month, we’ll slot this with a pull-quote and logo lockup. Holding as unscheduled until you confirm the link.",
      daysFromNow: null,
    },
  ]);

  await syncDemoCalendarPostImages(walkthroughSocial.id, {
    "March highlight": "riverside-demo-cal-hero.svg",
    "Behind the scenes": "riverside-demo-cal-bts.svg",
    "Launch week — hero still": "riverside-demo-cal-hero.svg",
    "Launch week — detail crop": "riverside-demo-cal-detail.svg",
    "Founder Friday — quote card": "riverside-demo-cal-quote.svg",
    "Carousel — 5-slide brand story": "riverside-demo-cal-carousel.svg",
    "Reels cover — 15s process": "riverside-demo-cal-bts.svg",
    "Educational — 3 myths": "riverside-demo-cal-quote.svg",
    "UGC reshare — client love": "riverside-demo-cal-flatlay.svg",
    "Weekend mood — single line": "riverside-demo-cal-quote.svg",
    "Mid-month check-in": "riverside-demo-cal-detail.svg",
    "Product flatlay — feed still": "riverside-demo-cal-flatlay.svg",
    "Stories sequence — polls": "riverside-demo-cal-carousel.svg",
    "Press snippet — optional": "riverside-demo-cal-quote.svg",
  });

  /**
   * Riverside — Social: pre-complete client brief, brand kit fields, and planning so the walkthrough account
   * lands on the calendar + sign-off flow (mirrors a submitted SocialOnboardingForm).
   */
  const riversideSocialOnboardingPayload = {
    businessOverview:
      "Riverside Studio is a boutique creative practice: brand, web, and ongoing social for independent businesses. We lead with clarity — one studio relationship from strategy through launch and retainers.",
    targetAudience:
      "Founders and lean teams (often 1–15 people) in creative, wellness, and lifestyle sectors who want cohesive identity and content without a full in-house marketing department.",
    visualStyle:
      "Quiet luxury and editorial calm: generous whitespace, warm neutrals, deep burgundy as anchor, refined type — captions confident and clear, never noisy or trend-chasing.",
    inspiringAccounts:
      "@collectivstudio for pacing; @kinfolk and @cerealmag for grid rhythm and still-life storytelling — we prefer slow, intentional sequences over constant selling.",
    existingBrandKit: "yes",
    brandingPackageNeeded: false,
    extraNotes: "Demo seed — safe to edit or reset in the portal.",
    postIdeas:
      "Monthly highlights, behind-the-scenes process, founder POV, educational carousels (myth-busting), product stills, soft CTAs (newsletter / book a call), occasional UGC reshare with a branded frame.",
    dealsPromos:
      "Optional mid-month mention if we run a gentle launch bundle; otherwise keep promotions light and value-led.",
    keyDates:
      "Launch-week cluster already reflected in the seeded calendar; flag bank holidays for softer tone; founder milestones optional for stories.",
    needPlanningHelp: false,
  };

  await prisma.project.update({
    where: { id: walkthroughSocial.id },
    data: {
      socialOnboardingJson: JSON.stringify(riversideSocialOnboardingPayload),
      socialOnboardingSubmittedAt: new Date(),
      websitePrimaryHex: "#250d18",
      websiteSecondaryHex: "#f2edeb",
      websiteAccentHex: "#5c3d2e",
      websiteQuaternaryHex: null,
      websiteFontPaths: "[]",
      inspirationLinksJson: JSON.stringify([
        {
          url: "https://www.pinterest.com/search/pins/?q=quiet%20luxury%20branding",
          label: "Quiet luxury mood",
          kind: "pinterest",
        },
        {
          url: "https://www.pinterest.com/search/pins/?q=editorial%20photography%20still%20life",
          label: "Editorial still life",
          kind: "pinterest",
        },
      ]),
    },
  });

  const walkthroughSocialCalendarCount = await prisma.contentCalendarItem.count({
    where: { projectId: walkthroughSocial.id },
  });

  const harrietUser = await prisma.user.findUnique({ where: { email: "harriet@collectiv.local" } });
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

  const isabellaUser = await prisma.user.findUnique({ where: { email: "isabella@collectiv.local" } });
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

  const mayUser = await prisma.user.findUnique({ where: { email: "may@collectiv.local" } });
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
    const studioHash = await bcrypt.hash("studio-password-change-me", 10);
    await prisma.user.upsert({
      where: { email: firstStudioEmail },
      update: {},
      create: {
        email: firstStudioEmail,
        passwordHash: studioHash,
        name: "Collectiv Studio",
      },
    });
    // eslint-disable-next-line no-console
    console.log(`Optional env-matched studio user (first STUDIO_EMAIL): ${firstStudioEmail} / studio-password-change-me`);
  }

  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("Seed OK — Riverside Studio walkthrough + studio logins:");
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("  Client (Riverside Studio — website, social, branding, signage)");
  // eslint-disable-next-line no-console
  console.log("    Email:    client-walkthrough@collectiv.local");
  // eslint-disable-next-line no-console
  console.log("    Password: collectiv-walkthrough");
  // eslint-disable-next-line no-console
  console.log(
    `    Projects: "${walkthroughWebName}" · "${walkthroughSocialName}" · "${walkthroughBrandingName}" · "${walkthroughSignageName}"`,
  );
  console.log(
    `    "${walkthroughSocialName}" has ${walkthroughSocialCalendarCount} calendar post(s) (studio-seeded copy; 2 signed off for demo).`,
  );
  console.log(
    `    "${walkthroughSocialName}" — client brief, brand colours, mood links & planning are pre-filled so the calendar opens immediately.`,
  );
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("  Agency / studio (all client projects, verify customers, etc.)");
  // eslint-disable-next-line no-console
  console.log("    Email:    agency@example.com");
  // eslint-disable-next-line no-console
  console.log("    Password: agency-demo-password");
  // eslint-disable-next-line no-console
  console.log('    STUDIO_EMAIL can list several emails (comma-separated) — all get studio access.');
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("  Named studio team (each has its own test password — add to STUDIO_EMAIL):");
  for (const t of teamSeed) {
    // eslint-disable-next-line no-console
    console.log(`    ${t.email}  /  ${t.testPassword}  (${t.welcomeName ?? t.name})`);
  }
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

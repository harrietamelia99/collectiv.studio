import type { ReactNode } from "react";

export type WhatToExpectStep = {
  title: string;
  description: string;
};

export type WhatToExpectContent = {
  heading: ReactNode;
  steps: readonly WhatToExpectStep[];
};

export const websiteDesignWhatToExpect: WhatToExpectContent = {
  heading: (
    <>
      From first enquiry to <em className="font-normal italic">go-live</em>
    </>
  ),
  steps: [
    {
      title: "Enquiry form",
      description:
        "Tell us about your business, audience, goals and any sites you admire—we’ll reply with fit and next steps.",
    },
    {
      title: "Discovery call",
      description:
        "A detailed call to align on scope, content, technical needs, timeline and the right package.",
    },
    {
      title: "Client portal",
      description:
        "You get a private portal to track progress, sign off rounds, upload website kit assets, and message us — one place for everything as the build moves forward.",
    },
    {
      title: "Proposal & deposit",
      description:
        "You receive a clear quote, milestones and contract. Once you’re happy, we secure the diary with a deposit.",
    },
    {
      title: "Design & build",
      description:
        "Wireframes and visual design, then build, content integration, SEO basics and testing—with rounds of feedback.",
    },
    {
      title: "Launch & handover",
      description:
        "Go-live support, handover notes and optional training so you can manage day-to-day with confidence.",
    },
  ],
};

export const brandingWhatToExpect: WhatToExpectContent = {
  heading: (
    <>
      From brief to a brand you can <em className="font-normal italic">use everywhere</em>
    </>
  ),
  steps: [
    {
      title: "Enquiry form",
      description:
        "Share your story, market, competitors and where you need the identity to show up first.",
    },
    {
      title: "Discovery call",
      description:
        "We dig into positioning, personality, practical touchpoints and what “done” looks like for you.",
    },
    {
      title: "Client portal",
      description:
        "Review identity rounds, approve deliverables and download files through your portal — clear sign-off and a full paper trail without inbox chaos.",
    },
    {
      title: "Strategy & concepts",
      description:
        "Direction, mood and initial creative routes—then we refine with your feedback into a single clear path.",
    },
    {
      title: "Refinement & guidelines",
      description:
        "Final logo, colour, type and usage rules packaged so your team and partners stay consistent.",
    },
    {
      title: "Handover",
      description:
        "Export-ready files plus guidance for web, print and social—optional support for rollout.",
    },
  ],
};

export const socialMediaWhatToExpect: WhatToExpectContent = {
  heading: (
    <>
      From onboarding to content that <em className="font-normal italic">sounds like you</em>
    </>
  ),
  steps: [
    {
      title: "Enquiry form",
      description:
        "Your platforms, tone of voice, capacity for approvals and what success looks like in 90 days.",
    },
    {
      title: "Discovery call",
      description:
        "We align on audiences, pillars, cadence, brand guardrails and how you like to review work.",
    },
    {
      title: "Client portal",
      description:
        "Your calendar, captions and approvals live in the portal — see what’s scheduled, leave feedback, and sign off posts in a few clicks.",
    },
    {
      title: "Onboarding",
      description:
        "Access, assets, key dates and a content calendar skeleton so nothing is improvised last minute.",
    },
    {
      title: "Create & review",
      description:
        "Drafts, captions and visuals for sign-off—scheduled once you’re happy, with room for campaigns.",
    },
    {
      title: "Optimise",
      description:
        "Light reporting, what’s working and quarterly tweaks so the feed stays intentional—not noisy.",
    },
  ],
};

export const preLaunchSuiteWhatToExpect: WhatToExpectContent = {
  heading: (
    <>
      One journey: brand, site and social <em className="font-normal italic">in sync</em>
    </>
  ),
  steps: [
    {
      title: "Enquiry form",
      description:
        "Your launch window, channels, existing assets and what you need live on day one.",
    },
    {
      title: "Discovery call",
      description:
        "A single detailed session to prioritise identity, website and launch social so nothing fights for attention.",
    },
    {
      title: "Client portal",
      description:
        "Track all three workstreams in one hub — branding sign-offs, website kit progress, and social calendar — with direct messaging to the studio.",
    },
    {
      title: "Suite plan",
      description:
        "A coordinated timeline across workstreams—when you see brand, when the site follows, when social locks in.",
    },
    {
      title: "Build sprints",
      description:
        "Parallel sprints with clear sign-off points: identity, site build, profiles and launch graphics together.",
    },
    {
      title: "Launch & handover",
      description:
        "Coordinated go-live, file pack and guidance so you step into market with one cohesive story.",
    },
  ],
};

export const aboutPageWhatToExpect: WhatToExpectContent = {
  heading: (
    <>
      What it&apos;s like to work <em className="font-normal italic">with us</em>
    </>
  ),
  steps: [
    {
      title: "Enquiry form",
      description:
        "Reach out via the contact form with a short brief—goals, timeline and the services you’re curious about.",
    },
    {
      title: "Discovery call",
      description:
        "A detailed call to confirm fit, clarify scope, talk timeline and answer questions on both sides.",
    },
    {
      title: "Client portal",
      description:
        "Once you’re onboarded, the portal keeps you oriented — milestones, approvals, file handovers and a single message thread with the team.",
    },
    {
      title: "Proposal",
      description:
        "Clear deliverables, investment and milestones. Adjust until it feels right, then we lock the plan.",
    },
    {
      title: "Kickoff",
      description:
        "Access, key contacts, ways of working and a shared view of what happens week by week.",
    },
    {
      title: "Delivery",
      description:
        "Checkpoints, reviews and refinements through to launch—and support so you’re not left guessing after.",
    },
  ],
};

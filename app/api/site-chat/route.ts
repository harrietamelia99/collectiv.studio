import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeChatQuestion } from "@/lib/chat-question-normalize";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { faqMatchScore, siteFaqsStatic } from "@/lib/site-faqs-static";

const CHAT_WINDOW_MS = 60_000;
const CHAT_MAX_PER_WINDOW = 24;

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = rateLimit(`site-chat:${ip}`, CHAT_MAX_PER_WINDOW, CHAT_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a minute and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 24_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const msg =
    typeof body === "object" && body !== null && "message" in body
      ? String((body as { message: unknown }).message).trim()
      : "";
  if (!msg) {
    return NextResponse.json({ reply: "Ask a short question and we’ll do our best to help." });
  }
  if (msg.length > 2000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const key = normalizeChatQuestion(msg);
  if (key.length < 2) {
    return NextResponse.json({
      reply:
        "Could you add a bit more detail? For project quotes and timelines, the contact form reaches the team fastest.",
    });
  }

  const stat = await prisma.chatQuestionStat.upsert({
    where: { normalizedKey: key },
    create: { normalizedKey: key, sampleQuestion: msg.slice(0, 500), count: 1 },
    update: {
      count: { increment: 1 },
      sampleQuestion: msg.slice(0, 500),
    },
  });

  if (stat.count > 5) {
    await prisma.faqSuggestion
      .upsert({
        where: { normalizedKey: key },
        create: {
          normalizedKey: key,
          sampleQuestion: msg.slice(0, 600),
          askCount: stat.count,
          status: "PENDING",
        },
        update: {
          askCount: stat.count,
          sampleQuestion: msg.slice(0, 600),
        },
      })
      .catch(() => {});
  }

  const dynamic = await prisma.siteFaq.findMany();
  let best = { score: 0, a: "", q: "" };
  for (const f of siteFaqsStatic) {
    const s = faqMatchScore(msg, f.q);
    if (s > best.score) best = { score: s, a: f.a, q: f.q };
  }
  for (const f of dynamic) {
    const s = faqMatchScore(msg, f.question);
    if (s > best.score) best = { score: s, a: f.answer, q: f.question };
  }
  if (best.score >= 2 && best.a) {
    return NextResponse.json({ reply: best.a });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a concise assistant for Collectiv. Studio, a UK boutique creative studio (brand, web, social). Answer in under 100 words. For pricing, contracts, or bespoke scope, direct users to the website contact form or client portal. Never invent prices.",
            },
            { role: "user", content: msg },
          ],
          max_tokens: 220,
        }),
      });
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return NextResponse.json({ reply: text });
    } catch {
      /* fall through */
    }
  }

  return NextResponse.json({
    reply:
      "Thanks for reaching out. The studio answers project-specific questions quickest via the contact form. If you’re already a client, sign in to your portal to message the team directly.",
  });
}

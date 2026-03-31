#!/usr/bin/env node
/**
 * Sanity-check env vars that commonly break production (Vercel + Supabase + NextAuth).
 * Loads `.env` from the repo root when present (does not override existing process.env).
 *
 * Usage:
 *   node scripts/check-vercel-env.mjs
 *   # or after exporting Vercel-style vars:
 *   DATABASE_URL=... NEXTAUTH_URL=... node scripts/check-vercel-env.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");

function loadDotEnv() {
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function need(name) {
  const v = process.env[name]?.trim();
  return { ok: Boolean(v), value: v ?? "" };
}

function warn(msg) {
  console.warn(`⚠ ${msg}`);
}

function bad(msg) {
  console.error(`✗ ${msg}`);
}

function good(msg) {
  console.log(`✓ ${msg}`);
}

loadDotEnv();

let errors = 0;

const db = need("DATABASE_URL");
const direct = need("DIRECT_URL");
const secret = need("NEXTAUTH_SECRET");
const nextAuthUrl = need("NEXTAUTH_URL");

if (!db.ok) {
  bad("DATABASE_URL is missing");
  errors++;
} else {
  good("DATABASE_URL is set");
  const u = db.value.toLowerCase();
  if (!u.includes("sslmode=require") && !u.includes("sslmode=verify-full")) {
    warn("DATABASE_URL should include sslmode=require (Supabase / Vercel)");
  }
  if (u.includes(":6543") && !u.includes("pgbouncer=true")) {
    warn("Port 6543 (transaction pooler) usually needs pgbouncer=true in the query string");
  }
}

if (!direct.ok) {
  bad("DIRECT_URL is missing (required by prisma/schema.prisma directUrl)");
  errors++;
} else {
  good("DIRECT_URL is set");
}

if (!secret.ok) {
  bad("NEXTAUTH_SECRET is missing — set a long random value on Vercel Production");
  errors++;
} else if (secret.value.length < 32) {
  warn("NEXTAUTH_SECRET should be at least 32 characters for production");
} else {
  good("NEXTAUTH_SECRET is set");
}

if (!nextAuthUrl.ok) {
  bad("NEXTAUTH_URL is missing — must be your live site URL (e.g. https://….vercel.app)");
  errors++;
} else {
  good("NEXTAUTH_URL is set");
  const u = nextAuthUrl.value.toLowerCase();
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    bad("NEXTAUTH_URL must start with http:// or https://");
    errors++;
  }
  if (u.startsWith("http://127.") || u.startsWith("http://localhost")) {
    warn("NEXTAUTH_URL looks like localhost — use your real HTTPS URL on Vercel");
  }
  if (u.startsWith("https://") && !u.includes("localhost") && !u.includes("127.0.0.1")) {
    good("NEXTAUTH_URL looks like a public URL");
  }
}

const studio = process.env.STUDIO_EMAIL?.trim();
if (!studio) {
  warn("STUDIO_EMAIL is empty — agency logins must be listed here (comma-separated)");
} else {
  good("STUDIO_EMAIL is set");
}

const ut = need("UPLOADTHING_TOKEN");
if (!ut.ok) {
  warn("UPLOADTHING_TOKEN is missing — portal uploads will error until set (UploadThing dashboard → API keys)");
} else {
  good("UPLOADTHING_TOKEN is set");
}

console.log("");
if (errors > 0) {
  console.error(`Failed with ${errors} error(s). Fix and redeploy on Vercel (Environment Variables → Production).`);
  process.exit(1);
}
console.log("All critical checks passed. Copy the same values to Vercel → Production → Redeploy if needed.");

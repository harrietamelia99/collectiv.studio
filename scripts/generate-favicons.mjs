/**
 * One-shot: rasterise public/favicon-source.svg → PNGs for browsers / PWA.
 * Run: node scripts/generate-favicons.mjs
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "favicon-source.svg");

async function main() {
  const svg = await readFile(svgPath);
  const base = sharp(svg).png();

  await base.clone().resize(32, 32).toFile(join(root, "public", "favicon-32.png"));
  await base.clone().resize(48, 48).toFile(join(root, "public", "favicon-48.png"));
  await base.clone().resize(180, 180).toFile(join(root, "public", "apple-touch-icon.png"));

  // eslint-disable-next-line no-console
  console.log("Wrote public/favicon-32.png, favicon-48.png, apple-touch-icon.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

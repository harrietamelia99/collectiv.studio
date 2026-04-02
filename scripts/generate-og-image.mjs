/**
 * Build public/og-collectiv-studio.png (1200×630) for LinkedIn / Facebook / X previews.
 * Run: node scripts/generate-og-image.mjs
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outPath = join(root, "public", "og-collectiv-studio.png");
const logoPath = join(root, "public", "images", "logo-wordmark.svg");

const W = 1200;
const H = 630;
const CREAM = { r: 242, g: 237, b: 235 };

async function main() {
  const svgBuf = await readFile(logoPath);
  const logoW = 680;
  const logoPng = await sharp(svgBuf).resize({ width: logoW }).png().toBuffer();
  const meta = await sharp(logoPng).metadata();
  const lw = meta.width ?? logoW;
  const lh = meta.height ?? 120;
  const left = Math.round((W - lw) / 2);
  const top = Math.round((H - lh) / 2) - 12;

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: CREAM,
    },
  })
    .composite([{ input: logoPng, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  // eslint-disable-next-line no-console
  console.log("Wrote", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

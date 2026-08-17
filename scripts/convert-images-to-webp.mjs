import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.resolve("public");
const extensions = new Set([".png", ".jpg", ".jpeg"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else if (extensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
  }
  return files;
}

const files = await walk(publicDir);
let originalBytes = 0;
let webpBytes = 0;

for (const input of files) {
  const output = input.replace(/\.(png|jpe?g)$/i, ".webp");
  const before = await readFile(input);
  const originalHash = createHash("sha256").update(before).digest("hex");

  await sharp(before, { animated: false })
    .rotate()
    .webp({ quality: 82, smartSubsample: true, effort: 6, alphaQuality: 90 })
    .toFile(output);

  const after = await readFile(input);
  const afterHash = createHash("sha256").update(after).digest("hex");
  if (originalHash !== afterHash) {
    throw new Error(`Original image was modified: ${input}`);
  }

  originalBytes += before.length;
  webpBytes += (await stat(output)).size;
}

const saved = originalBytes - webpBytes;
console.log(JSON.stringify({
  converted: files.length,
  originalBytes,
  webpBytes,
  savedBytes: saved,
  savedPercent: Number(((saved / originalBytes) * 100).toFixed(2)),
}, null, 2));

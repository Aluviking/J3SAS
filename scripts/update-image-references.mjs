import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDir = path.resolve("src");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

let replacements = 0;
for (const file of await walk(sourceDir)) {
  const source = await readFile(file, "utf8");
  const updated = source.replace(/(\/[^"'`\s]+)\.(?:png|jpe?g)(?=["'`])/gi, (_, imagePath) => {
    replacements += 1;
    return `${imagePath}.webp`;
  });
  if (updated !== source) await writeFile(file, updated);
}

console.log(`Updated ${replacements} image reference(s) to WebP.`);

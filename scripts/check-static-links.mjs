import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] || "site";
const htmlFiles = readdirSync(root).filter((file) => file.endsWith(".html"));
const assetPattern = /(?:href|src)=["']([^"']+)["']/g;
const externalPattern = /^(https?:|mailto:|tel:|#|javascript:)/i;
const missingLinks = [];

for (const file of htmlFiles) {
  const html = readFileSync(join(root, file), "utf8");

  for (const match of html.matchAll(assetPattern)) {
    const url = match[1];

    if (externalPattern.test(url)) {
      continue;
    }

    const localPath = url.split("#")[0].split("?")[0];

    if (!localPath || localPath.endsWith("/")) {
      continue;
    }

    if (!existsSync(join(root, localPath))) {
      missingLinks.push(`${file} -> ${url}`);
    }
  }
}

if (missingLinks.length > 0) {
  console.error(missingLinks.join("\n"));
  process.exit(1);
}

console.log(`OK: ${htmlFiles.length} HTML files checked in ${root}`);

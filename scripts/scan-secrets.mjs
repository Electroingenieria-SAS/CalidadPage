import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set(["node_modules", ".next", ".git", "dist", "out", "coverage"]);
const ignoredFiles = new Set(["package-lock.json"]);
const textExt = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".sql", ".toml", ".yml", ".yaml", ".txt"]);
const findings = [];
const patterns = [
  ["Supabase secret key", /sb_secret_[A-Za-z0-9_-]{12,}/g],
  ["Supabase publishable literal", /sb_publishable_(?!REEMPLAZAR|xxx|example)[A-Za-z0-9_-]{12,}/g],
  ["Private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ["GitHub token", /gh[pousr]_[A-Za-z0-9]{20,}/g],
  ["AWS access key", /AKIA[0-9A-Z]{16}/g],
  ["Generic service-role JWT", /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g],
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    const rel = path.relative(root, full).replaceAll("\\", "/");
    if (rel === ".env.example" || ignoredFiles.has(entry.name)) continue;
    if (!textExt.has(path.extname(entry.name)) && !entry.name.startsWith(".env")) continue;
    const content = fs.readFileSync(full, "utf8");
    for (const [label, regex] of patterns) {
      regex.lastIndex = 0;
      const matches = content.match(regex) || [];
      for (const match of matches) findings.push({ rel, label, preview: `${match.slice(0, 10)}…` });
    }
  }
}
walk(root);
if (findings.length) {
  console.error("[scan:secrets] Se detectaron posibles secretos literales:");
  for (const item of findings) console.error(` - ${item.rel}: ${item.label} (${item.preview})`);
  process.exit(1);
}
console.log("[scan:secrets] Sin secretos literales conocidos.");

import fs from "fs";
import path from "path";

function walk(dir: string, cb: (fp: string) => void) {
  const files = fs.readdirSync(dir);
  files.forEach((f) => {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) walk(fp, cb);
    else cb(fp);
  });
}

const root = process.cwd();
const suspect: string[] = [];
const include = ["app", "components", "features"];

include.forEach((p) => {
  const dir = path.join(root, p);
  if (!fs.existsSync(dir)) return;
  walk(dir, (fp) => {
    const content = fs.readFileSync(fp, "utf8");
    if (
      content.includes("/mocks/") ||
      content.includes("mockService") ||
      content.includes("overviewMockService")
    ) {
      suspect.push(fp);
    }
  });
});

if (suspect.length) {
  console.warn("mock-audit: Found possible mock imports in app paths:");
  suspect.forEach((s) => console.warn(" -", s));
} else {
  console.log("mock-audit: No suspicious mock imports found in app paths");
}

// Build bản tĩnh cho GitHub Pages (thư mục out/). API AI (app/api/**/route.ts) được bỏ qua
// nhờ pageExtensions: ["tsx"] trong next.config.ts khi GITHUB_PAGES=1.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

execSync("next build", { stdio: "inherit", env: { ...process.env, GITHUB_PAGES: "1" } });
writeFileSync("out/.nojekyll", ""); // cho phép GitHub Pages phục vụ thư mục _next

import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appName = process.argv[2];
if (!["admin", "account", "tienda"].includes(appName)) {
  throw new Error(`Unknown single-file app: ${appName ?? "(missing)"}`);
}

const scriptsDir = fileURLToPath(new URL(".", import.meta.url));
const webRoot = resolve(scriptsDir, "..");
const builtHtml = resolve(webRoot, "app", appName, "dist", "index.html");
const publicHtml = resolve(webRoot, `${appName}.html`);
copyFileSync(builtHtml, publicHtml);
console.log(`Published ${appName}.html`);
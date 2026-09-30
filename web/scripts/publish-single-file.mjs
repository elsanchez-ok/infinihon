import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appName = process.argv[2];

// App -> nombre del archivo publicado en web/ (landing es la home: index.html)
const PUBLISH_AS = {
  landing: "index.html",
  auth: "auth.html",
  member: "member.html",
  tienda: "tienda.html",
  admin: "admin.html",
  account: "account.html",
};

if (!appName || !PUBLISH_AS[appName]) {
  throw new Error(`Unknown single-file app: ${appName ?? "(missing)"}`);
}

const scriptsDir = fileURLToPath(new URL(".", import.meta.url));
const webRoot = resolve(scriptsDir, "..");
const builtHtml = resolve(webRoot, "app", appName, "dist", "index.html");
const publicHtml = resolve(webRoot, PUBLISH_AS[appName]);
copyFileSync(builtHtml, publicHtml);
console.log(`Published ${PUBLISH_AS[appName]}`);
#!/usr/bin/env node
/**
 * Next.js standalone build keeps the server entrypoint inside `.next/standalone`.
 * The runtime expects `.next/static` and `public` folders to live next to `server.js`.
 * This script copies both folders into the standalone directory after `next build`.
 */
const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, ".next", "standalone");
const staticSrc = path.join(rootDir, ".next", "static");
const publicSrc = path.join(rootDir, "public");

function findServerDir(dir) {
  const directServer = path.join(dir, "server.js");
  if (fs.existsSync(directServer)) {
    return dir;
  }

  const queue = [dir];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === "node_modules") {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name === "server.js") {
        return current;
      }
    }
  }

  return standaloneDir;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[standalone] skip copy, source not found: ${src}`);
    return;
  }
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`[standalone] copied ${path.relative(rootDir, src)} -> ${path.relative(rootDir, dest)}`);
}

if (!fs.existsSync(standaloneDir)) {
  console.warn("[standalone] directory not found, skipping asset copy");
  process.exit(0);
}

const serverDir = findServerDir(standaloneDir);
const staticDest = path.join(serverDir, ".next", "static");
const publicDest = path.join(serverDir, "public");

copyDir(staticSrc, staticDest);
copyDir(publicSrc, publicDest);

if (serverDir !== standaloneDir) {
  const shimPath = path.join(standaloneDir, "server.js");
  const relativeTarget = path.relative(standaloneDir, path.join(serverDir, "server.js")).replace(/\\/g, "/");
  fs.writeFileSync(
    shimPath,
    `#!/usr/bin/env node\nrequire("./${relativeTarget}");\n`,
    "utf8",
  );
  fs.chmodSync(shimPath, 0o755);
  console.log(`[standalone] wrote server shim -> ${relativeTarget}`);
}

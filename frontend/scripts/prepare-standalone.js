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
const staticDest = path.join(standaloneDir, ".next", "static");
const publicSrc = path.join(rootDir, "public");
const publicDest = path.join(standaloneDir, "public");

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

copyDir(staticSrc, staticDest);
copyDir(publicSrc, publicDest);

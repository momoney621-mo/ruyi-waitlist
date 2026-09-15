/**
 * A static server for the waitlist site, so `npm run site` works on a clean
 * checkout with nothing installed. Node's own http and fs, no dependencies —
 * the page has none either, and adding one here just to look at it would be
 * the wrong trade.
 *
 *   node site/serve.mjs [port]
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".md": "text/plain; charset=utf-8",
  ".sql": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";

  // never serve outside the site directory, whatever the request says
  const target = join(ROOT, normalize(pathname).replace(/^(\.\.[/\\])+/, ""));
  if (!target.startsWith(ROOT)) {
    res.writeHead(403).end("forbidden");
    return;
  }

  try {
    const info = await stat(target);
    const file = info.isDirectory() ? join(target, "index.html") : target;
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`port ${PORT} is already in use.`);
    console.error(`  try: npm run site -- ${PORT + 1}`);
    console.error(`  or stop whatever is on ${PORT}: lsof -i :${PORT}`);
    process.exit(1);
  }
  throw err;
});

// Bind beyond loopback so Cursor's browser/port forwarder can reach the
// server across the container boundary. The site is still exposed only where
// the development environment publishes this port.
server.listen(PORT, "0.0.0.0", () => {
  console.log(`the waitlist site is at http://localhost:${PORT}`);
});

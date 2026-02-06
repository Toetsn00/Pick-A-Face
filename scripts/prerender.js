#!/usr/bin/env node
import { createServer } from "vite";
import http from "http";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const PORT = 5173;
const HOST = `http://localhost:${PORT}`;
const routes = ["/", "/ko/"];
const cwd = process.cwd();

async function main() {
  let server;
  let httpServer;
  try {
    console.log("Starting Vite dev server...");
    server = await createServer({
      root: cwd,
      server: { middlewareMode: true },
    });

    const app = server.middlewares;
    httpServer = http.createServer(app);

    await new Promise((resolve) => {
      httpServer.listen(PORT, () => {
        console.log(`Server ready at ${HOST}`);
        resolve();
      });
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    for (const route of routes) {
      const url = HOST + (route === "/" ? "/" : route);
      console.log("Rendering", url);
      try {
        await page.goto(url, { waitUntil: "networkidle2" });
        const html = await page.content();
        const outDir = path.join(
          cwd,
          "dist",
          route === "/" ? "" : route.replace(/^\//, ""),
        );
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
        console.log("✓ Wrote", path.join(outDir, "index.html"));
      } catch (e) {
        console.error("✗ Failed to render", url, ":", e.message);
      }
    }

    await browser.close();
    console.log("✓ Prerender complete.");
    httpServer.close();
  } catch (e) {
    console.error("✗ Error:", e.message);
    process.exitCode = 1;
  } finally {
    if (server) await server.close();
  }
}

main();

#!/usr/bin/env node
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { preview } from "vite";

const routes = ["/", "/ko/"];
const cwd = process.cwd();

async function main() {
  let previewServer;
  try {
    console.log("Starting Vite preview server...");
    previewServer = await preview({
      preview: {
        port: 4173,
      },
    });

    const HOST = "http://localhost:4173";

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    for (const route of routes) {
      const url = HOST + route;
      console.log("Rendering", url);

      await page.goto(url, { waitUntil: "networkidle0" });
      const html = await page.content();

      const outDir = path.join(
        cwd,
        "dist",
        route === "/" ? "" : route.replace(/^\//, ""),
      );

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
      console.log("✓ Wrote", path.join(outDir, "index.html"));
    }

    await browser.close();
    console.log("✓ Prerender complete.");
  } catch (e) {
    console.error("✗ Error:", e.message);
    process.exitCode = 1;
  } finally {
    if (previewServer) await previewServer.httpServer.close();
  }
}

main();

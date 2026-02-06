#!/usr/bin/env node
import { spawn } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const PORT = process.env.PORT || 5000;
const HOST = `http://localhost:${PORT}`;
const routes = ["/", "/ko/"];

function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http
        .get(url, (res) => {
          resolve();
        })
        .on("error", () => {
          if (Date.now() - start > timeout) reject(new Error("timeout"));
          else setTimeout(check, 500);
        });
    };
    check();
  });
}

async function main() {
  const server = spawn("npx", ["vite", "preview", "--port", String(PORT)], {
    stdio: "ignore",
  });
  try {
    console.log("Waiting for preview server...");
    await waitForServer(HOST);
    console.log("Preview server ready:", HOST);

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    for (const route of routes) {
      const url = HOST.replace(/\/$/, "") + (route === "/" ? "/" : route);
      console.log("Rendering", url);
      await page.goto(url, { waitUntil: "networkidle0" });
      const html = await page.content();
      const outDir = path.join(
        process.cwd(),
        "dist",
        route === "/" ? "" : route.replace(/^\//, ""),
      );
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
      console.log("Wrote", path.join(outDir, "index.html"));
    }

    await browser.close();
    console.log("Prerender complete.");
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    try {
      server.kill();
    } catch (e) {
      /* ignore */
    }
  }
}

main();

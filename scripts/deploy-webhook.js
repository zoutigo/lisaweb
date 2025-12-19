#!/usr/bin/env node
/**
 * Minimal webhook server to trigger deploy.sh from GitHub Actions (or another CI).
 * Protect with a shared token passed in header X-Deploy-Token.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require("http");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawn } = require("child_process");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

const PORT = process.env.DEPLOY_PORT || 4000;
const TOKEN = process.env.DEPLOY_TOKEN;
const REPO_DIR = process.env.REPO_DIR || process.cwd();
const BRANCH = process.env.BRANCH || "main";

if (!TOKEN) {
  console.error("DEPLOY_TOKEN is required");
  process.exit(1);
}

function runDeploy(res) {
  const scriptPath = path.join(REPO_DIR, "scripts", "deploy.sh");
  const proc = spawn("bash", [scriptPath], {
    cwd: REPO_DIR,
    env: { ...process.env, BRANCH, REPO_DIR },
  });

  let output = "";
  proc.stdout.on("data", (d) => (output += d.toString()));
  proc.stderr.on("data", (d) => (output += d.toString()));

  proc.on("close", (code) => {
    res.writeHead(code === 0 ? 200 : 500, { "Content-Type": "text/plain" });
    res.end(output || `deploy exited with code ${code}`);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405);
    return res.end("Method not allowed");
  }

  const headerToken = req.headers["x-deploy-token"];
  if (headerToken !== TOKEN) {
    res.writeHead(401);
    return res.end("Unauthorized");
  }

  runDeploy(res);
});

server.listen(PORT, () => {
  console.log(`Deploy webhook listening on port ${PORT}`);
});

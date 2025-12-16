/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, ".next", "standalone", "server.js");

// Si le build n'existe pas encore, on renvoie une page 503 au lieu de crasher Passenger (500)
if (!fs.existsSync(serverPath)) {
  const http = require("http");
  const port = parseInt(process.env.PORT || "3000", 10);

  http
    .createServer((req, res) => {
      res.statusCode = 503;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(
        "Application en cours d'installation. Lancez `npm ci` puis `npm run build`, puis redémarrez Passenger.",
      );
    })
    .listen(port, "0.0.0.0", () => {
      console.log("Waiting for build output (.next/standalone/server.js)...");
    });

  return;
}

process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
process.env.PORT = process.env.PORT || "3000";

process.chdir(path.dirname(serverPath));
require(serverPath);

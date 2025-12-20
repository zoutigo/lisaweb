/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const appRoot = __dirname;
const standaloneDir = path.join(appRoot, ".next", "standalone");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.PORT = process.env.PORT || "3000";

// Run from the standalone directory
process.chdir(standaloneDir);

require(path.join(standaloneDir, "server.js"));

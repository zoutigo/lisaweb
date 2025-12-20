/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

// App root = directory of this file
const appRoot = __dirname;

// Passenger can start in a different CWD -> force it
process.chdir(appRoot);

process.env.NODE_ENV = process.env.NODE_ENV || "production";
// cPanel/Passenger provides PORT, fallback just in case
process.env.PORT = process.env.PORT || "3000";

// Launch Next.js standalone server
require(path.join(appRoot, ".next", "standalone", "server.js"));

/* eslint-disable @typescript-eslint/no-require-imports */
// server.js (Next.js standalone on cPanel/Passenger)
const path = require("path");

// Ensure correct working directory (important on Passenger)
process.chdir(__dirname);

// The standalone output includes its own server entry
require(path.join(__dirname, ".next", "standalone", "server.js"));

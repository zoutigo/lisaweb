/* eslint-disable @typescript-eslint/no-require-imports */
// server.js (Next.js standalone on cPanel/Passenger)
const path = require("path");

// Ensure correct working directory (important on Passenger)
process.chdir(__dirname);

// cPanel/Passenger provides PORT
process.env.PORT = process.env.PORT || "3000";
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Ensure Next standalone can locate the .next directory at app root
process.env.NEXT_PRIVATE_STANDALONE_DIR = path.join(
  appRoot,
  ".next",
  "standalone",
);

// The standalone output includes its own server entry
require(path.join(__dirname, ".next", "standalone", "server.js"));

/* eslint-disable @typescript-eslint/no-require-imports */
// Bootstrap Next.js standalone output for hosting (e.g., o2switch Node service)
const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, ".next", "standalone", "server.js");

if (!fs.existsSync(serverPath)) {
  console.error(
    "Build output not found. Run `npm run build` before starting the server.",
  );
  process.exit(1);
}

// Ensure Next binds correctly on platforms that expect 0.0.0.0
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
process.env.PORT = process.env.PORT || "3000";

// Run from the standalone folder so relative imports resolve
process.chdir(path.dirname(serverPath));
require(serverPath);

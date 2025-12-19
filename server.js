/* eslint-disable @typescript-eslint/no-require-imports */
// Démarrage Next.js classique (non-standalone) pour o2switch
const { execSync } = require("child_process");

const port = parseInt(process.env.PORT || "3000", 10);
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

execSync(`node node_modules/next/dist/bin/next start -p ${port}`, {
  stdio: "inherit",
});

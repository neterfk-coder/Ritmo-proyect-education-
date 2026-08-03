/**
 * Creates server/.env from the example on first run.
 *
 * Setup friction is a real cost when a reviewer has forty repositories to open.
 * The default it writes runs the whole app with no API key.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(here, "../.env");
const example = path.resolve(here, "../.env.example");

if (!fs.existsSync(target)) {
  fs.copyFileSync(example, target);
  console.log("  Created server/.env — running on the offline engine.");
}

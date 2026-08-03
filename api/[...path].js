/**
 * The whole API, as one serverless function.
 *
 * Vercel routes every request under /api here, and Express does its own
 * matching from there — so the routes are identical to the ones that run
 * locally and there is no second copy of the routing table to keep in sync.
 */
export { app as default } from "../server/src/app.js";

import { app } from "../server/src/app.js";

/**
 * The whole API, as one serverless function.
 *
 * Every request under /api is rewritten here by vercel.json, which carries the
 * original path along in `__ritmo_path`. Filesystem catch-all routing was the
 * obvious way to do this and it only ever matched a single segment under this
 * project's layout, so the routing is stated explicitly instead of inferred —
 * a deploy that silently loses every two-segment route is worse than a config
 * file with one more line in it.
 *
 * Express then does its own matching, so the routes here are identical to the
 * ones that run locally and there is no second routing table to keep in sync.
 */
export default function handler(req, res) {
  const url = new URL(req.url ?? "/", "http://ritmo.local");
  const original = url.searchParams.get("__ritmo_path");

  if (original) {
    url.searchParams.delete("__ritmo_path");
    const query = url.searchParams.toString();
    req.url = original + (query ? `?${query}` : "");
  }

  return app(req, res);
}

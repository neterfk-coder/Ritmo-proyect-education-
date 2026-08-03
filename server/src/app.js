import express from "express";
import cors from "cors";
import { api } from "./routes/index.js";
import { errorHandler } from "./lib/http.js";

/**
 * The Express app, with no listener attached.
 *
 * Split out from index.js so the same app can be served two ways: as a
 * long-running process locally (`index.js`), and as a serverless function on
 * a host (`api/[...path].js`). Nothing about the routes changes between them.
 */
export const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/api", api);
app.use((_req, res) => res.status(404).json({ error: "No route there." }));
app.use(errorHandler);

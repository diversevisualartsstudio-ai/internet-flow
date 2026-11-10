import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkTcpTarget, validateTarget } from "./src/monitor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Internet Flow API", version: "1.0.0", timestamp: new Date().toISOString() });
});

app.post("/api/check", async (req, res) => {
  const { host, port: targetPort = 443, timeoutMs = 5000 } = req.body ?? {};
  const validation = validateTarget(host, targetPort, timeoutMs);
  if (!validation.ok) return res.status(400).json({ error: validation.error });
  try {
    const result = await checkTcpTarget(host, targetPort, timeoutMs);
    res.json({ ...result, checkedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: "The connectivity check could not be completed.", detail: error.message });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(port, "0.0.0.0", () => {
  console.log(`Internet Flow listening on port ${port}`);
});

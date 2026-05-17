import { Hono } from "hono";
import api from "./routes";
import { getStore } from "@ml-engine/core";

const app = new Hono();
app.route("/api", api);

const port = parseInt(process.env.API_PORT || "4321");
console.log(`🚀 API server running on http://localhost:${port}`);
console.log(`   Health: http://localhost:${port}/api/health`);

const shutdown = () => {
  console.log("Shutting down API server gracefully...");
  try {
    getStore().close();
  } catch {}
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default {
  port,
  fetch: app.fetch,
};

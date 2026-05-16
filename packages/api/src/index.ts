import { Hono } from "hono";
import api from "./routes";

const app = new Hono();
app.route("/api", api);

const port = parseInt(process.env.API_PORT || "4321");
console.log(`🚀 API server running on http://localhost:${port}`);
console.log(`   Health: http://localhost:${port}/api/health`);

export default {
  port,
  fetch: app.fetch,
};

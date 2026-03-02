import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { setupVite } from "./vite.js";
import { globalLimiter } from "./middlewares/rateLimit.js";
import { securityHeaders } from "./middlewares/securityHeaders.js";

const app = express();
const httpServer = createServer(app);

app.use(securityHeaders);
app.use("/api", globalLimiter);
app.use(cors({
  exposedHeaders: ['RateLimit-Policy', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).substring(0, 200)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
 httpServer.listen(port, () => {
  log(`serving on http://localhost:${port}`);
}); 
})();

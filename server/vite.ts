import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

// Fix for __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamically import the Vite config as ESM, omitting the extension for Node compatibility
  const viteConfig = (await import("../vite.config.mjs")).default;
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // Hapus process.exit agar Railway tidak crash
        // process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      // Use built index.html in production, source in dev
      const clientTemplate =
        process.env.NODE_ENV === "production"
          ? path.resolve(__dirname, "..", "client", "dist", "index.html")
          : path.resolve(__dirname, "..", "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Perbaikan: gunakan path ke client/dist untuk produksi
  const distPath = path.resolve(__dirname, "..", "client", "dist");
  const indexPath = path.resolve(distPath, "index.html");

  if (!fs.existsSync(distPath) || !fs.existsSync(indexPath)) {
    // Jangan crash, log error dan kirim response 500 jika di production
    app.use((_req, res) => {
      res.status(500).send(
        `Could not find the build directory or index.html: ${distPath}.\n` +
          `Make sure to build the client first.\n` +
          `If you are on Railway, add 'npm run build --workspaces' to your deploy script.`,
      );
    });
    console.error(`ERROR: Missing client build at ${distPath}`);
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}

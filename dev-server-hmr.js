import express from "express";
import { watch } from "chokidar";
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = Number.parseInt(process.env.PORT || "3000");
const WS_PORT = 24679;

const app = express();
app.disable("x-powered-by");

// Create HTTP server
const server = createServer(app);

// WebSocket server for custom HMR
const wss = new WebSocketServer({ port: WS_PORT });

console.log("Starting enhanced development server with route HMR");
const viteDevServer = await import("vite").then((vite) =>
  vite.createServer({
    server: { 
      middlewareMode: true,
      hmr: {
        port: 24678,
      },
    },
    optimizeDeps: {
      include: ["react-router", "react", "react-dom"],
    },
  })
);

app.use(viteDevServer.middlewares);
app.use(async (req, res, next) => {
  try {
    const source = await viteDevServer.ssrLoadModule("./server/app.ts");
    return await source.default(req, res, next);
  } catch (error) {
    if (typeof error === "object" && error instanceof Error) {
      viteDevServer.ssrFixStacktrace(error);
    }
    next(error);
  }
});

// Watch route files specifically
const routeWatcher = watch('app/routes/**/*.tsx', {
  ignored: /node_modules/,
  persistent: true
});

routeWatcher.on('change', (path) => {
  console.log(`🔄 Route file changed: ${path} - broadcasting reload`);
  
  // Send reload message to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ type: 'route-reload', path }));
    }
  });
  
  // Also trigger Vite's HMR
  viteDevServer.ws.send({
    type: 'full-reload'
  });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected to HMR WebSocket');
  
  ws.on('close', () => {
    console.log('Client disconnected from HMR WebSocket');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 HMR WebSocket on ws://localhost:${WS_PORT}`);
});

process.on('SIGTERM', () => {
  routeWatcher.close();
  wss.close();
  server.close();
});
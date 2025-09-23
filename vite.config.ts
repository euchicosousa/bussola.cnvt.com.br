import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild, command }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server/app.ts",
        }
      : undefined,
  },

  ssr: {
    // Não inclua a dependência 'openai' no bundle SSR.
    // Deixe a Vercel resolver isso no ambiente de execução.
    // Adicione outras dependências pesadas aqui se necessário.
    noExternal: command === "build" ? ["openai"] : undefined,
  },

  server: {
    hmr: {
      port: 24678,
      // Force full reload for route files
      overlay: true,
    },
    fs: {
      // Allow serving files outside of root
      allow: [".."],
    },
  },

  // Enhanced HMR configuration
  optimizeDeps: {
    include: ["react-router", "react", "react-dom"],
    force: true,
  },

  plugins: [
    reactRouter(),
    tsconfigPaths(),
    tailwindcss(),
    // Custom plugin to force refresh on route changes
    {
      name: "react-router-hmr",
      handleHotUpdate({ file, server }) {
        // Force full reload for route files
        if (file.includes("/routes/") && file.endsWith(".tsx")) {
          console.log(`🔄 Route file changed: ${file} - forcing full reload`);

          // Multiple approaches to ensure reload
          server.ws.send({
            type: "full-reload",
          });

          // Also send update for the specific file
          const module = server.moduleGraph.getModuleById(file);
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }

          // Return empty array to prevent default HMR
          return [];
        }

        // Also reload if any imported file in helpers changes
        if (file.includes("/lib/helpers") || file.includes("/components/")) {
          console.log(
            `📦 Helper/Component changed: ${file} - triggering update`,
          );
          return; // Let default HMR handle it
        }
      },

      configureServer(server) {
        // Additional server configuration
        server.middlewares.use("/api/reload", (req, res) => {
          if (req.method === "POST") {
            console.log("📡 Manual reload triggered");
            server.ws.send({ type: "full-reload" });
            res.end("OK");
          }
        });
      },
    },
  ],
}));

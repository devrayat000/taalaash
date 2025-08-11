// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tanstackStart({
			tsr: {
				// Specifies the directory TanStack Router uses for your routes.
				routesDirectory: "src/app", // Defaults to "src/routes"
			},
			customViteReactPlugin: true,
			sitemap: { enabled: true, host: "https://taalaash.com" },
			pages: [
				{
					path: "/",
					prerender: { enabled: true },
				},
			],
			prerender: {
				filter: (page) => page.prerender?.enabled,
				crawlLinks: false,
				concurrency: 3,
				autoSubfolderIndex: false,
				enabled: true,
				headers: {
					"X-Content-Type-Options": "nosniff",
					"X-Frame-Options": "DENY",
					"X-XSS-Protection": "1; mode=block",
					"Strict-Transport-Security":
						"max-age=63072000; includeSubDomains; preload",
					"Referrer-Policy": "no-referrer",
					"X-Prerender-Mode": "auto",
				},
			},
		}),
		react(),
		tailwindcss(),
		// Enables Vite to resolve imports using path aliases.
		tsconfigPaths(),
	],
	build: {
		// minify: true,
	},
	// resolve: { external: ["postgres"] },
});

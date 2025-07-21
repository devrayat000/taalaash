import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./lib/query-client";
import { pineconeIndex } from "./lib/pinecone";

const context = {
	queryClient,
};

export type Context = typeof context;

const hostname = typeof window !== "undefined" ? window.location.hostname : "";

const basepath = hostname === "admin.taalaash.com" ? "/admin" : "/";

export function createRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		context,
		basepath,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}

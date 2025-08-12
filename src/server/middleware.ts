import { authClient } from "@/lib/auth-client";
import { hash } from "node:crypto";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getHeaders, setResponseStatus } from "@tanstack/react-start/server";

export const authed = createMiddleware({ type: "function" }).server(
	async ({ next, signal }) => {
		const { data } = await authClient.getSession({
			fetchOptions: {
				headers: getHeaders() as HeadersInit,
				signal,
			},
		});
		if (!data) {
			setResponseStatus(401);
			throw new Error("Unauthorized");
		}

		return next({
			context: {
				user: data.user,
			},
		});
	},
);

export const isAdmin = createMiddleware({ type: "function" })
	.middleware([authed])
	.server(async ({ next, context }) => {
		if (context.user?.role !== "admin") {
			setResponseStatus(401);
			throw new Error("You are not authorized to access this resource");
		}

		return next();
	});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
	async ({ signal }) => {
		// TODO: Implement caching with hashed key
		const data = await authClient.getSession({
			fetchOptions: {
				headers: getHeaders() as HeadersInit,
				signal,
			},
		});

		return data;
	},
);

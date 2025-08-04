import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import {
	getHeaders,
	isError,
	setResponseStatus,
} from "@tanstack/react-start/server";

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
		const data = await authClient.getSession({
			fetchOptions: {
				headers: getHeaders() as HeadersInit,
				signal,
			},
		});

		return data;
	},
);

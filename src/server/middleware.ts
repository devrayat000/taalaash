import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { getHeaders, isError } from "@tanstack/react-start/server";

export const authed = createMiddleware({ type: "function" }).server(
	async ({ next, signal }) => {
		const { data } = await authClient.getSession({
			fetchOptions: {
				headers: getHeaders() as HeadersInit,
				signal,
			},
		});
		if (!data) {
			throw redirect({ to: "/" });
		}

		return next({
			context: {
				user: data.user,
			},
		});
	},
);

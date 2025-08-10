import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Fragment } from "react";
import { string, object } from "zod/mini";
import Header from "../../~components/header";

function SearchLayout() {
	return (
		<Fragment>
			<Header />
			<div className="relative z-10">
				<Outlet />
			</div>
		</Fragment>
	);
}

export const Route = createFileRoute("/_root/_routes/_search")({
	component: SearchLayout,
	validateSearch: object({
		query: string(),
	}),
	async beforeLoad({ context, search }) {
		if (!context.isAuthenticated) {
			throw redirect({
				to: "/signin",
				search: {
					error: "You need to sign in before searching.",
					redirect: `/search?query=${encodeURIComponent(search.query)}`,
				},
			});
		}
	},
});

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Fragment } from "react";
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
	async beforeLoad({ context }) {
		if (!context.isAuthenticated) {
			throw redirect({
				to: "/signin",
				search: { error: "You need to sign in before searching." },
			});
		}
	},
});

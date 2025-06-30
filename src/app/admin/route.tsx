import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
	async beforeLoad({ context }) {
		console.log(context.user);

		if (context.user?.role !== "admin") {
			throw redirect({ to: "/", search: { error: "Unauthorized" } });
		}
	},
});

function RouteComponent() {
	return <Outlet />;
}

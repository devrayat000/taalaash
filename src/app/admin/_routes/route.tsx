import Navbar from "@/app/admin/_routes/~components/navbar";
import { Outlet } from "@tanstack/react-router";
// import { ThemeProvider } from "@/providers/theme-provider";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Fragment } from "react";

function DashboardLayout() {
	return (
		<Fragment>
			<Navbar />
			<Outlet />
		</Fragment>
	);
}

export const Route = createFileRoute("/admin/_routes")({
	component: DashboardLayout,
	async beforeLoad({ context }) {
		console.log(context.user);

		if (context.user?.role !== "admin") {
			throw redirect({
				to: "/signin",
				search: { error: "Unauthorized" },
			});
		}
	},
});

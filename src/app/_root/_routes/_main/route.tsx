import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "../../~components/header";
import AdminBar from "../../~components/admin-bar";

function MainLayout() {
	return (
		<div className="min-h-screen bg-background">
			<AdminBar />
			<Header />
			<main className="relative">
				<Outlet />
			</main>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main")({
	component: MainLayout,
});

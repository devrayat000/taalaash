function MainLayout() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<main className="relative">
				<Outlet />
			</main>
		</div>
	);
}

import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "../../~components/header";

export const Route = createFileRoute("/_root/_routes/_main")({
	component: MainLayout,
});

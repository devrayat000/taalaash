import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "../../~components/header";
import AdminBar from "../../~components/admin-bar";
import { BottomNav } from "@/components/ui/bottom-nav";

function MainLayout() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<main className="relative">
				<Outlet />
			</main>
			<BottomNav />
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main")({
	component: MainLayout,
});

// import Navbar from "@/app/admin/_routes/~components/navbar";
// import { ThemeProvider } from "@/providers/theme-provider";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";

function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<Fragment>
			{/* <Navbar /> */}
			{children}
		</Fragment>
	);
}

export const Route = createFileRoute("/admin/_routes")({
	component: DashboardLayout,
});

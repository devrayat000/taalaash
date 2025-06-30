// import Header from "../components/header";
// import { getBookmarkedList } from "@/server/bookmark/service";
// import { ServerStoreProvider } from "@/hooks/use-server-data";
import { PopupProvider } from "@/providers/popup-provider";

function MainLayout() {
	// const [bookmarks] = await Promise.all([getBookmarkedList()]);

	return (
		// <ServerStoreProvider initialData={{ bookmarks, searchHistory: [] }}>
		//   {children}
		//   <PopupProvider />
		// </ServerStoreProvider>
		<Fragment>
			<Outlet />
			<PopupProvider />
		</Fragment>
	);
}

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Fragment } from "react";

export const Route = createFileRoute("/_root/_routes")({
	component: MainLayout,
});

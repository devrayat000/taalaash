import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { HomeIcon, SearchIcon, BookmarkIcon } from "lucide-react";

const navigationItems = [
	{ href: "/", label: "Home", icon: HomeIcon },
	{ href: "/search", label: "Search", icon: SearchIcon },
	{ href: "/bookmarks", label: "Bookmarks", icon: BookmarkIcon },
];

export function BottomNav() {
	const location = useLocation();

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
			<div className="flex items-center justify-around px-4 py-3">
				{navigationItems.map((item) => {
					const isActive =
						location.pathname === item.href ||
						(item.href === "/search" &&
							location.pathname.startsWith("/search"));

					return (
						<Link
							key={item.href}
							to={item.href}
							className={cn(
								"flex flex-col items-center justify-center transition-colors",
								"min-w-0 flex-1",
								isActive
									? "text-[#00B894]"
									: "text-gray-500 hover:text-gray-700",
							)}
						>
							<item.icon className="h-6 w-6 mb-1" />
							<span className="text-xs font-medium">{item.label}</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

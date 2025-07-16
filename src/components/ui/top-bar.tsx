import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { MenuIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoSq from "@/assets/logo.png?url";

interface TopBarProps {
	title?: string;
	showBack?: boolean;
	showMenu?: boolean;
	actions?: React.ReactNode;
	className?: string;
}

const navigationItems = [
	{ href: "/", label: "Home" },
	{ href: "/search", label: "Search" },
	{ href: "/bookmarks", label: "Bookmarks" },
	{ href: "/search-history", label: "Search History" },
	{ href: "/whats-new", label: "What's New?" },
	{ href: "/subscriptions", label: "Subscriptions" },
	{ href: "/content-gallery", label: "Content Gallery" },
	{ href: "/my-footprints", label: "My Footprints" },
];

function DrawerNav() {
	return (
		<div className="flex flex-col space-y-4 p-4">
			{/* Logo */}
			<Link to="/" className="flex items-center space-x-2 pb-4 border-b">
				<img src={logoSq} alt="Taalaash" className="w-8 h-8" />
				<span className="font-bold text-xl text-[#00B894]">Taalaash</span>
			</Link>

			{/* Navigation Links */}
			<div className="flex flex-col space-y-2">
				{navigationItems.map((item) => (
					<Link
						key={item.href}
						to={item.href}
						className="flex items-center rounded-md px-3 py-3 text-sm font-medium hover:bg-gray-100 text-gray-700"
					>
						<span>{item.label}</span>
					</Link>
				))}
			</div>
		</div>
	);
}

export function TopBar({
	title,
	showBack = false,
	showMenu = true,
	actions,
	className,
}: TopBarProps) {
	return (
		<div
			className={cn(
				"sticky top-0 z-40 bg-white border-b border-gray-200",
				className,
			)}
		>
			<div className="flex items-center justify-between px-4 h-14">
				{/* Left side */}
				<div className="flex items-center space-x-3">
					{showBack && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => window.history.back()}
							className="p-2"
						>
							<ArrowLeftIcon className="h-5 w-5" />
						</Button>
					)}

					{showMenu && !showBack && (
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm" className="p-2">
									<MenuIcon className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-80 p-0">
								<DrawerNav />
							</SheetContent>
						</Sheet>
					)}

					{title && (
						<h1 className="text-lg font-semibold text-gray-900 truncate">
							{title}
						</h1>
					)}
				</div>

				{/* Right side */}
				<div className="flex items-center space-x-2">{actions}</div>
			</div>
		</div>
	);
}

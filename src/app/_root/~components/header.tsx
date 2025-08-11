import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
	BookmarkIcon,
	HistoryIcon,
	StarIcon,
	FolderIcon,
	ActivityIcon,
	MenuIcon,
	SearchIcon,
	HomeIcon,
} from "lucide-react";
import logoSq from "@/assets/logo.png?url";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import UserAvatar from "./user-avatar";
import AdminBar from "./admin-bar";

const navigationItems = [
	{ href: "/whats-new", label: "What's New?", icon: StarIcon },
	{ href: "/bookmarks", label: "Bookmarks", icon: BookmarkIcon },
	{ href: "/subscriptions", label: "Subscriptions", icon: FolderIcon },
	{ href: "/content-gallery", label: "Content Gallery", icon: FolderIcon },
	{ href: "/my-footprints", label: "My Footprints", icon: ActivityIcon },
];

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const { data } = useSession();
	const isAdmin = data?.user?.role === "admin";

	return (
		<header
			className={cn(
				"sticky px-10 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 top-0",
			)}
		>
			{isAdmin && <AdminBar />}
			<div className="container flex h-14 max-w-screen-2xl items-center justify-between">
				{/* Logo and Brand */}
				<div className="mr-4 hidden md:flex">
					<Link to="/" className="mr-6 flex items-center space-x-2">
						<img src={logoSq} alt="Taalaash" className="h-6 w-6" />
						<span className="hidden font-bold text-xl text-[#00B894] sm:inline-block">
							Taalaash
						</span>
					</Link>
				</div>

				{/* Mobile Menu Trigger */}
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
						>
							<MenuIcon className="h-6 w-6" />
							<span className="sr-only">Toggle Menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="pr-0">
						<MobileNav />
					</SheetContent>
				</Sheet>

				<NavigationMenu className="hidden md:flex md:flex-1">
					<NavigationMenuList>
						{navigationItems.map((item) => (
							<NavigationMenuItem key={item.href}>
								<NavigationMenuLink
									asChild
									className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#00B894] transition-colors"
								>
									<Link to={item.href}>{item.label}</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
				</NavigationMenu>

				{/* Desktop Navigation */}
				{/* <div className="flex items-center justify-between space-x-2 md:justify-end"> */}
				{/* User Avatar */}
				<UserAvatar />
				{/* </div> */}
			</div>
		</header>
	);
}

function MobileNav() {
	const { pathname } = useLocation();

	return (
		<div className="flex flex-col space-y-3">
			{/* Mobile Logo */}
			<Link to="/" className="flex items-center space-x-2 pb-4 border-b">
				<img src={logoSq} alt="Taalaash" className="h-8 w-8" />
				<span className="font-bold text-xl text-[#00B894]">Taalaash</span>
			</Link>

			{/* Mobile Navigation Links */}
			<div className="flex flex-col space-y-3">
				{/* {navigationItems.map((item) => {
					const isActive = router.location.pathname === item.href;
					return (
						<Link
							key={item.href}
							to={item.href}
							className={cn(
								"flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
								isActive
									? "bg-accent text-accent-foreground"
									: "text-foreground/60",
							)}
						>
							<item.icon className="h-5 w-5" />
							<span>{item.label}</span>
						</Link>
					);
				})} */}
				<NavigationMenu className="hidden md:flex md:flex-1">
					<NavigationMenuList>
						{navigationItems.map((item) => (
							<NavigationMenuItem key={item.href}>
								<NavigationMenuLink
									asChild
									className={cn(
										"flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#00B894] transition-colors",
										pathname === item.href
											? "bg-accent text-accent-foreground"
											: "text-foreground/60",
									)}
								>
									<Link to={item.href}>{item.label}</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</div>
	);
}

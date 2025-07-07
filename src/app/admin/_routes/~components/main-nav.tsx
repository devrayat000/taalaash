import { cn } from "@/lib/utils";
import logoSingle from "@/assets/logo_single.png?url";
import { Link, useLocation } from "@tanstack/react-router";

class NavPath {
	constructor(
		public href: string,
		public label: string,
	) {}

	active = (pathname: string) => {
		return pathname === this.href;
	};
}

export function MainNav({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) {
	const pathname = useLocation().pathname;

	const routes = [
		new NavPath(`/admin`, "Dashboard"),
		new NavPath(`/admin/subjects`, "Subjects"),
		new NavPath(`/admin/books`, "Books"),
		new NavPath(`/admin/chapters`, "Chapters"),
		new NavPath(`/admin/posts`, "Posts"),
	];

	return (
		<nav
			className={cn("flex items-center space-x-4 lg:space-x-6", className)}
			{...props}
		>
			<Link to="/admin">
				<img src={logoSingle} alt="Logo" height={52} />
			</Link>
			{routes.map((route) => (
				<Link
					key={route.href}
					to={route.href}
					className={cn(
						"text-sm font-medium transition-colors hover:text-primary",
						route.active(pathname)
							? "text-black dark:text-white"
							: "text-muted-foreground",
					)}
				>
					{route.label}
				</Link>
			))}
		</nav>
	);
}

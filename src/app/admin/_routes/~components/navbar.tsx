import logoSingle from "@/assets/logo_single.png?url";
import { Button } from "../../../../components/ui/button";

import NavLinks from "./nav-links";
import LogoutButton from "./logout-button";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";
import NavDrawer from "./nav-drawer";

const Navbar = () => {
	return (
		<div className="border-b">
			<div className="flex gap-x-1 h-16 items-center px-4">
				<section className="flex items-center gap-x-8">
					<Link to="/admin">
						<img src={logoSingle} alt="Logo" height={52} width={52} />
					</Link>
					<div className="hidden md:block flex-1 h-min">
						<NavLinks />
					</div>
				</section>
				<div className="ml-auto flex items-center space-x-4">
					<ThemeToggle />
					<div className="hidden md:block">
						<LogoutButton />
					</div>
				</div>
				<NavDrawer />
			</div>
		</div>
	);
};

export default Navbar;

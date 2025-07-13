import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutButton from "./logout";
import { useSession } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { getAvatarLetters } from "@/lib/utils";
import { ShieldIcon } from "lucide-react";

export default function UserAvatar() {
	const { data } = useSession();

	if (!data?.session) {
		// redirect("/signin");
		return null;
	}

	const isAdmin = data?.user?.role === "admin";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative h-10 md:h-12 w-10 md:w-12 rounded-full"
				>
					<Avatar className="h-8 md:h-10 w-8 md:w-10">
						{data.user.image && (
							<AvatarImage
								src={data.user.image}
								alt={getAvatarLetters(data.user.name!)}
							/>
						)}
						<AvatarFallback>{getAvatarLetters(data.user.name!)}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild className="cursor-pointer">
					<Link to="/bookmarks">Bookmarks</Link>
				</DropdownMenuItem>
				{isAdmin && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							asChild
							className="cursor-pointer text-orange-600"
						>
							<Link to="/admin" className="flex items-center space-x-2">
								<ShieldIcon className="h-4 w-4" />
								<span>Admin Dashboard</span>
							</Link>
						</DropdownMenuItem>
					</>
				)}
				<LogoutButton />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

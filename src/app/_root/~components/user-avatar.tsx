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
import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { getAvatarLetters } from "@/lib/utils";

export default function UserAvatar() {
  const { data } = authClient.useSession.get();
  console.log(data);

  if (!data?.session) {
    // redirect("/signin");
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 md:h-12 w-10 md:w-12 rounded-full"
        >
          <Avatar className="h-10 md:h-12 w-10 md:w-12">
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
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

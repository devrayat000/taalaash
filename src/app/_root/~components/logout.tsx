"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  return (
    <DropdownMenuItem onClick={() => authClient.signOut()}>
      Logout
    </DropdownMenuItem>
  );
}

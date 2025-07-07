import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
	return (
		<Button variant="destructive" onClick={() => authClient.signOut()}>
			Log Out
		</Button>
	);
}

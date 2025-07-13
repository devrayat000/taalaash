import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [adminClient()],
	// You can add more options here if needed
});

export const { useSession, signIn, signOut } = authClient;

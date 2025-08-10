import { createFileRoute, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/icons/google";
import bgBlack from "@/assets/bg_black.jpeg?url";
import logoSingle from "@/assets/logo_single.png?url";
import { authClient } from "@/lib/auth-client";
import { object, optional, string } from "zod/mini";
import { useEffect } from "react";
import { toast } from "sonner";

function SigninPage() {
	const search = useSearch({ from: "/_root/_auth/signin" });

	useEffect(() => {
		console.log(search);

		if (search.error) {
			toast.error(search.error);
		}
	}, [search.error]);

	return (
		<div className="w-full lg:grid lg:grid-cols-2">
			<div className="relative flex items-center justify-center py-12 h-screen lg:h-auto isolate">
				<div className="mx-auto grid w-[350px] gap-6">
					<div className="flex justify-center">
						<img
							src={logoSingle}
							alt="logo"
							className="w-44 md:w-60 lg:w-auto"
						/>
					</div>
					<div className="grid gap-4">
						<Button
							variant="outline"
							className="w-full cursor-pointer"
							onClick={() =>
								authClient.signIn.social({
									provider: "google",
									// callbackURL: ""
								})
							}
						>
							<GoogleIcon className="mr-6 h-6 w-6" /> Login with Google
						</Button>
						{/* <GoogleLogin
              login_uri=""
              onSuccess={(credentialResponse) => {
              console.log(credentialResponse);

              authClient.signIn.social({
                provider: "google",
                idToken: {
                  token: credentialResponse.credential,
                },
                // callbackURL: ""
              });
            }} /> */}
					</div>
				</div>
			</div>
			<div className="hidden bg-muted lg:block">
				<img
					src={bgBlack}
					alt="sherlock holmes"
					className="object-cover w-full lg:max-h-screen"
				/>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_auth/signin")({
	component: SigninPage,
	validateSearch: object({
		error: optional(string()),
	}),
});

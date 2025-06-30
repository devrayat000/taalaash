import { createFileRoute } from "@tanstack/react-router";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";

import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/icons/google";
import bgBlack from "@/assets/bg_black.jpeg?url";
import logoSingle from "@/assets/logo_single.png?url";
import { authClient } from "@/lib/auth-client";

function SigninPage() {
  // const googleLogin = useGoogleLogin({
  //   onSuccess(credentialResponse) {
  //     console.log(credentialResponse);

  //     authClient.signIn.social({
  //       provider: "google",
  //       idToken: {
  //         token: credentialResponse.access_token,
  //       },
  //       // callbackURL: ""
  //     });
  //   },
  // });

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
          alt="Image"
          className="object-cover w-full lg:max-h-screen"
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_root/_auth/signin")({
  component: SigninPage,
});

// "use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GoogleOAuthProvider } from "@react-oauth/google";

function HomeLayout() {
  return (
    <div className="relative h-screen overflow-hidden">
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Outlet />
      </GoogleOAuthProvider>
    </div>
  );
}

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_root")({
  component: HomeLayout,
});

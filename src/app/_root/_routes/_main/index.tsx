import { createFileRoute } from "@tanstack/react-router";

import logoSingle from "@/assets/logo_single.png?url";
import SearchForm from "../_search/search/~components/search-form";

function LandingPage() {
  return (
    <div className="h-full flex justify-center min-h-[calc(100svh-8.5rem)]">
      <div className="w-full max-w-[52rem] my-20 mx-auto">
        <div className="flex justify-center mb-10">
          <img src={logoSingle} alt="logo" width={200} />
        </div>
        <div className="max-w-[52rem] mx-auto">
          <SearchForm />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_root/_routes/_main/")({
  component: LandingPage,
});

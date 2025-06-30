import { createFileRoute, Outlet } from "@tanstack/react-router";
import SearchHeader from "./~components/search-header";
import { Fragment } from "react";

function SearchLayout() {
  return (
    <Fragment>
      <SearchHeader />
      <div className="relative z-10">
        <Outlet />
      </div>
    </Fragment>
  );
}

export const Route = createFileRoute("/_root/_routes/_search")({
  component: SearchLayout,
});

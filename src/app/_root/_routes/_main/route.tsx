function MainLayout() {
  return (
    <Fragment>
      <Header />
      <div className="relative z-10">
        <Outlet />
      </div>
      <Footer className="absolute bottom-0" />
    </Fragment>
  );
}

import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "../../~components/footer";
import { Fragment } from "react/jsx-runtime";
import Header from "../../~components/header";

export const Route = createFileRoute("/_root/_routes/_main")({
  component: MainLayout,
});

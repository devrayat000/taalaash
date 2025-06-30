"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LogoutButton from "./logout-button";

class NavPath {
  constructor(public href: string, public label: string) {}

  active = (pathname: string) => {
    return pathname === this.href;
  };
}

export default function NavLinks({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    new NavPath(`/admin`, "Dashboard"),
    new NavPath(`/admin/subjects`, "Subjects"),
    new NavPath(`/admin/books`, "Books"),
    new NavPath(`/admin/chapters`, "Chapters"),
    new NavPath(`/admin/posts`, "Posts"),
  ];

  return (
    <nav
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center gap-y-2 gap-x-2 lg:gap-x-3",
        className
      )}
      {...props}
    >
      {routes.map((route) => (
        <Button
          asChild
          key={route.href}
          variant={route.active(pathname) ? "outline" : "ghost"}
        >
          <Link
            href={route.href}
            // className={cn(
            //   "text-sm font-medium transition-colors hover:text-primary",

            //     ? "text-black dark:text-white"
            //     : "text-muted-foreground"
            // )}
          >
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

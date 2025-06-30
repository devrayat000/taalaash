import { MainNav } from "@/app/admin/(routes)/components/main-nav";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MenuIcon } from "lucide-react";
import NavLinks from "./nav-links";
import { Separator } from "@/components/ui/separator";
import LogoutButton from "./logout-button";

export default function NavDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild className="md:hidden">
        <Button variant="outline" size="icon">
          <MenuIcon className="w-4 h-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm flex flex-col items-stretch px-2 pt-4 pb-16">
          <NavLinks />
          <Separator orientation="vertical" className="w-full h-px my-4" />
          <LogoutButton />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

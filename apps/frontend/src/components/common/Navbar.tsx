import { Link } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { NAVBAR_MENU } from "@/utils/Constants";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function Navbar() {
  return (
    <NavigationMenu>
      <div
        className="flex items-center justify-between w-full px-4 py-2 mt-2 bg-white/10 backdrop-blur-md border-b border-white/20 rounded-2xl shadow-lg">
     
        <div className="flex items-center gap-2">
          <motion.img
            src="images/doclinIcon.png"
            alt="Doclin Icon"
            className="w-12 h-12 lg:w-15 lg:h-15 object-contain"
          />
          <motion.p className="text-white text-xl font-bold">Doclin</motion.p>
        </div>
        <NavigationMenuList className="flex-1 flex justify-center gap-6">
          {NAVBAR_MENU.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild>
                <Link
                  to={item.href}
                  className="text-white hover:text-purple-300 transition"
                >
                  {item.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        <div className="flex items-center gap-3">
          <Button variant={"snowFlake"}>Login</Button>
          <Button variant={"standOut"}>Sign Up</Button>
        </div>
      </div>
    </NavigationMenu>
  );
}

export default Navbar;

import { Link, useRouter } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { NAVBAR_MENU } from "@/utils/Constants";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { clearUserInfo, getUserInfo } from "@/lib/auth";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "../ui/menubar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useApiMutation } from "@/hook/useApi";
import { logoutSchema, type ApiError, type LogoutResponse } from "@/types/api";
import { toast } from "sonner";
function Navbar() {
  // *********** All States ***********
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const user = getUserInfo();

  // *********** Effects ***********
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const mutation = useApiMutation<LogoutResponse>(
    {
      endpoint: "/auth/logout",
      method: "POST",
      responseSchema: logoutSchema,
    },
    {
      onSuccess: (data) => {
        clearUserInfo();
        toast.success(data.message || "Loggedout successfully.");
        router.navigate({ to: "/" });
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "failed to logout.");
        console.log(error);
      },
    }
  );
  const closeMobileMenu = () => setIsOpen(false);
  function handleLogout() {
    mutation.mutate(undefined);
  }
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      <NavigationMenu className="fixed top-0 left-0 right-0 z-50">
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`flex items-center justify-between w-full px-4 lg:px-8 py-3 mx-4 mt-4 transition-all duration-300 ${
            scrolled
              ? "bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl"
              : "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
          } rounded-2xl`}
        >
          <motion.div
            className="flex items-center gap-3 z-50"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="images/doclinIcon.png"
                alt="Doclin Icon"
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain drop-shadow-lg"
              />
            </motion.div>
            <motion.p
              className="text-white text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text"
              whileHover={{ scale: 1.05 }}
            >
              Doclin
            </motion.p>
          </motion.div>

          {/***************** Desktop Navigation *****************/}
          <NavigationMenuList className="hidden lg:flex flex-1 justify-center gap-8">
            {NAVBAR_MENU.map((item, index) => {
              const isActive =
                item.href === currentPath ||
                (item.href === "" && currentPath === "/");
              const isDisabled = item.enabled === false;
              return (
                <NavigationMenuItem key={item.href}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger
                        className={`relative px-4 py-2 rounded-lg transition-all bg-none duration-300 ${isActive ? "bg-white/20 font-bold shadow" : ""} ${isDisabled ? "pointer-events-none text-gray-400" : "text-white/90 hover:text-white"}`}
                      >
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="p-4 bg-white/10 rounded-xl shadow-lg">
                        <ul className="grid gap-3 w-[250px]">
                          {item.children.map((sub) => (
                            <li key={sub.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={sub.href}
                                  className="bg-white/10 block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white hover:text-black"
                                >
                                  <div className="text-sm font-medium">
                                    {sub.title}
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: isDisabled ? 0 : -2 }}
                      >
                        <Link
                          to={isDisabled ? undefined : item.href}
                          className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? "bg-white/20 font-bold shadow" : ""} ${isDisabled ? "pointer-events-none text-gray-400" : "text-white/90 hover:text-white"}`}
                          tabIndex={isDisabled ? -1 : 0}
                          aria-disabled={isDisabled}
                        >
                          <span className="relative z-10">{item.title}</span>
                          {!isDisabled && (
                            <motion.div
                              className="absolute inset-0 bg-white/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
                              whileHover={{ scale: 1.05 }}
                            />
                          )}
                          {!isDisabled && (
                            <motion.div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full group-hover:left-0 transition-all duration-300" />
                          )}
                        </Link>
                      </motion.div>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Menubar className="bg-transparent border-none">
                <MenubarMenu>
                  <MenubarTrigger className="bg-transparent">
                    <Avatar className="rounded-full">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </MenubarTrigger>
                  <MenubarContent className="mr-4 text-white/90 hover:text-white bg-white/50 backdrop-blur-md border border-white/20 shadow-lg">
                    <MenubarItem inset>{user.username}</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem
                      inset
                      onClick={handleLogout}
                      className="cursor-pointer"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span>Logout</span>
                        <LogOut color="white" />
                      </div>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/login">
                    <Button className="relative overflow-hidden group backdrop-blur-md bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all duration-300">
                      <span className="relative z-10">Login</span>
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/register">
                    <Button className="relative overflow-hidden group backdrop-blur-md bg-[#e4558d]/70 border border-[#e4558d]/40 text-white hover:bg-[#e4558d]/80 shadow-lg transition-all duration-300">
                      <span className="relative z-10">Sign Up</span>
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/************** Mobile Menu Button **************/}
          <motion.button
            className="lg:hidden relative z-50 p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/************** Mobile Navigation Menu *************/}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-2xl z-40 lg:hidden"
            >
              <div className="flex flex-col h-full pt-24 px-6">
                <nav className="flex flex-col gap-2 mb-8">
                  {NAVBAR_MENU.map((item, index) => {
                    const isDisabled = item.enabled === false;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={isDisabled ? undefined : item.href}
                          onClick={isDisabled ? undefined : closeMobileMenu}
                          className={`block py-3 px-4 rounded-xl font-medium transition-all duration-300 border border-transparent ${isDisabled ? "pointer-events-none text-gray-400 bg-gray-200/30" : "text-white text-lg hover:bg-white/10 hover:border-white/20"}`}
                          tabIndex={isDisabled ? -1 : 0}
                          aria-disabled={isDisabled}
                        >
                          {item.title}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
                <motion.div
                  className="flex flex-col gap-3 mt-auto mb-8"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {user ? (
                    <div className="text-white/90 hover:text-white bg-white/20 backdrop-blur-md border border-white/20 shadow-lg p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <Avatar className="rounded-full">
                          <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <LogOut
                          onClick={handleLogout}
                          className="cursor-pointer"
                        />
                      </div>
                      <p className=" text-white/80">{user.username}</p>
                      <p className="font-medium text-sm">{user.email}</p>
                    </div>
                  ) : (
                    <>
                      <Link to="/login" onClick={closeMobileMenu}>
                        <Button className="w-full relative overflow-hidden group backdrop-blur-md bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all duration-300">
                          Login
                        </Button>
                      </Link>

                      <Link to="/register" onClick={closeMobileMenu}>
                        <Button className="w-full shadow-lg relative overflow-hidden group backdrop-blur-md bg-[#e4558d]/70 border border-[#e4558d]/40 text-white hover:bg-[#e4558d]/80 transition-all duration-300">
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </NavigationMenu>
    </>
  );
}

export default Navbar;

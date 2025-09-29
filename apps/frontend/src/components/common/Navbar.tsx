import { Link, useRouter } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { NAVBAR_MENU } from "@/utils/Constants";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

function Navbar() {
  // *********** All States ***********
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  // *********** Effects ***********
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setIsOpen(false);

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
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                    >
                      <Link
                        to={item.href}
                        className={`relative text-white/90 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg group ${
                          isActive ? "bg-white/20 font-bold shadow" : ""
                        }`}
                      >
                        <span className="relative z-10">{item.title}</span>
                        <motion.div
                          className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.05 }}
                        />
                        <motion.div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full group-hover:left-0 transition-all duration-300" />
                      </Link>
                    </motion.div>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>

          <div className="hidden lg:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login">
                <Button className="relative overflow-hidden group backdrop-blur-md bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all duration-300">
                  <span className="relative z-10">Login</span>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/register">
                <Button className="relative overflow-hidden group backdrop-blur-md bg-[#e4558d]/70 border border-[#e4558d]/40 text-white hover:bg-[#e4558d]/80 shadow-lg transition-all duration-300">
                  <span className="relative z-10">Sign Up</span>
                </Button>
              </Link>
            </motion.div>
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
                  {NAVBAR_MENU.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        onClick={closeMobileMenu}
                        className="block text-white text-lg font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20"
                      >
                        {item.title}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                <motion.div
                  className="flex flex-col gap-3 mt-auto mb-8"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
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
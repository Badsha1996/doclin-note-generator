// __root.tsx - Updated with search params validation
import {
  Outlet,
  createRootRoute,
  useMatches,
  useRouterState,
} from "@tanstack/react-router";
import BackgroundLayout from "@/layouts/BackgroundLayout";
import Navbar from "@/components/common/Navbar";
import BetaBanner from "@/components/common/BetaBanner";
import { AnimatePresence, motion } from "framer-motion";
import GlassmorphicLoader from "@/components/common/GlassLoader";
import { z } from "zod";

const rootSearchSchema = z.object({
  oauth: z.string().optional(),
});

export const Route = createRootRoute({
  validateSearch: rootSearchSchema,
  component: RootComponent,
  pendingComponent: () => (
    <GlassmorphicLoader fullScreen message="Loading page..." size="lg" />
  ),
});

function RootComponent() {
  const matches = useMatches();
  const routerState = useRouterState();

  const isLoading = routerState.isLoading;

  const isAuthRoute = matches.some(
    (m) => m.routeId === "/login/" || m.routeId === "/register/"
  );

  return (
    <div className="relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 1, transformOrigin: "right", opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GlassmorphicLoader fullScreen message="Loading..." />
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthRoute && <Navbar />}
      {!isAuthRoute && <BetaBanner />}

      <BackgroundLayout>
        <AnimatePresence mode="wait">
          <motion.div
            key={routerState.location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </BackgroundLayout>
    </div>
  );
}
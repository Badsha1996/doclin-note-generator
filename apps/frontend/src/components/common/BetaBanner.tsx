import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

export default function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: +40, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full flex justify-end z-50 sticky top-[100px] px-5"
        >
          <Alert className="relative w-110 bg-purple-100 border border-purple-300 text-purple-800 shadow-md p-3 rounded-lg ">
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="absolute top-2 right-2 h-6 w-6 p-1 rounded-full border border-purple-400 text-purple-800 hover:bg-purple-200 hover:border-purple-500 transition-colors"
            >
              <X />
            </Button>
            <AlertTitle className="font-bold flex items-center gap-2">
              ⚠️ Beta Version
            </AlertTitle>
            <AlertDescription>
              <span className="text-gray-600">
                This app is still in <strong>Beta</strong> — features may change
                or break.
              </span>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

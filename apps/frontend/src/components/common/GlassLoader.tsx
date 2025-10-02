import { motion } from "framer-motion";

interface GlassmorphicLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const GlassmorphicLoader = ({
  message = "Loading...",
  size = "md",
  fullScreen = false,
}: GlassmorphicLoaderProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-4 h-4",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-6">
        {/* Glassmorphic Container with animated ring */}
        <div className="relative">
          {/* Outer rotating ring */}
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)]`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-slate-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-md" />
          </motion.div>

          {/* Inner pulsing circle */}
          <motion.div
            className="absolute inset-0 m-auto w-1/2 h-1/2 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Orbiting dots */}
          {[0, 120, 240].map((rotation, index) => (
            <motion.div
              key={index}
              className={`absolute ${dotSizes[size]} rounded-full bg-white shadow-lg shadow-indigo-500/50`}
              style={{
                top: "50%",
                left: "50%",
                marginTop: `-${size === "sm" ? "3" : size === "md" ? "5" : "8"}px`,
                marginLeft: `-${size === "sm" ? "3" : size === "md" ? "5" : "8"}px`,
              }}
              animate={{
                rotate: [rotation, rotation + 360],
                x: [0, size === "sm" ? 20 : size === "md" ? 35 : 50],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.2,
              }}
            />
          ))}
        </div>

        {/* Loading text with shimmer effect */}
        <div className="relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-md px-6 py-3 border border-white/20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <p className="relative z-10 text-white font-medium text-sm tracking-wide">
            {message}
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlassmorphicLoader;

// Examples of use
// <GlassmorphicLoader size="sm" message="Loading data..." />
// <GlassmorphicLoader message="Fetching your content..." />
// <GlassmorphicLoader size="lg" message="Processing request..." />

import * as React from "react";
import { motion } from "framer-motion";

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

export default function BackgroundLayout({ children }: BackgroundLayoutProps) {
  const particles = React.useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 20,
    }))
  , []);

  return (
    <React.Fragment>
      {/* Main animated gradient background */}
      <motion.div 
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      
      {/* Secondary moving gradient overlay */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-tr from-cyan-600/20 via-transparent to-pink-500/20"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(6, 182, 212, 0.2) 0%, transparent 50%, rgba(236, 72, 153, 0.2) 100%)",
            "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, transparent 50%, rgba(59, 130, 246, 0.2) 100%)",
            "linear-gradient(225deg, rgba(34, 197, 94, 0.2) 0%, transparent 50%, rgba(251, 146, 60, 0.2) 100%)",
            "linear-gradient(315deg, rgba(6, 182, 212, 0.2) 0%, transparent 50%, rgba(236, 72, 153, 0.2) 100%)"
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating light orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-32 h-32 rounded-full blur-xl"
            style={{
              background: [
                "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, transparent 70%)"
              ][i],
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-white/30 rounded-full blur-sm"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Crystalline pattern overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='crystal' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpolygon points='10,1 19,7 19,13 10,19 1,13 1,7' fill='none' stroke='white' stroke-width='0.5' opacity='0.3'/%3E%3Cpolygon points='10,5 15,8 15,12 10,15 5,12 5,8' fill='white' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23crystal)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </div>

      {/* Subtle noise texture for depth */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Grid pattern for structure */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content container with enhanced backdrop */}
      <div className="relative min-h-screen">
        <div className="w-full min-h-screen bg-transparent backdrop-blur-[0.5px]">
          {children}
        </div>
      </div>
    </React.Fragment>
  );
}
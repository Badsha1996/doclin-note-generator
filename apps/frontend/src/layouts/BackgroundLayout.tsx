import * as React from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

export default function BackgroundLayout({ children }: BackgroundLayoutProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Create smooth spring animations for mouse movement
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Create different transform ranges for various layers (parallax effect)
  const rotateX1 = useTransform(smoothMouseY, [0, window.innerHeight], [5, -5]);
  const rotateY1 = useTransform(smoothMouseX, [0, window.innerWidth], [-5, 5]);
  const rotateX2 = useTransform(smoothMouseY, [0, window.innerHeight], [3, -3]);
  const rotateY2 = useTransform(smoothMouseX, [0, window.innerWidth], [-3, 3]);
  const rotateX3 = useTransform(smoothMouseY, [0, window.innerHeight], [8, -8]);
  const rotateY3 = useTransform(smoothMouseX, [0, window.innerWidth], [-8, 8]);

  // Transform for particles (subtle movement)
  const particleX = useTransform(
    smoothMouseX,
    [0, window.innerWidth],
    [-20, 20]
  );
  const particleY = useTransform(
    smoothMouseY,
    [0, window.innerHeight],
    [-20, 20]
  );

  // Transform for orbs (more dramatic movement)
  const orbX = useTransform(smoothMouseX, [0, window.innerWidth], [-60, 60]);
  const orbY = useTransform(smoothMouseY, [0, window.innerHeight], [-60, 60]);

  const particles = React.useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 20,
        depth: Math.random() * 0.5 + 0.5, // Depth factor for 3D effect
      })),
    []
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-full overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* Main animated gradient background with 3D rotation */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          rotateX: rotateX1,
          rotateY: rotateY1,
          transformStyle: "preserve-3d",
        }}
      />

      {/* Secondary moving gradient overlay with different 3D depth */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-tr from-cyan-600/20 via-transparent to-pink-500/20"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(6, 182, 212, 0.2) 0%, transparent 50%, rgba(236, 72, 153, 0.2) 100%)",
            "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, transparent 50%, rgba(59, 130, 246, 0.2) 100%)",
            "linear-gradient(225deg, rgba(34, 197, 94, 0.2) 0%, transparent 50%, rgba(251, 146, 60, 0.2) 100%)",
            "linear-gradient(315deg, rgba(6, 182, 212, 0.2) 0%, transparent 50%, rgba(236, 72, 153, 0.2) 100%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          rotateX: rotateX2,
          rotateY: rotateY2,
          transformStyle: "preserve-3d",
        }}
      />

      {/* Floating light orbs with 3D movement */}
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
                "radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, transparent 70%)",
              ][i],
              x: orbX,
              y: orbY,
              rotateX: rotateX3,
              rotateY: rotateY3,
              transformStyle: "preserve-3d",
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
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Floating particles with depth-based mouse interaction */}
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
              x: useTransform(particleX, (x) => x * particle.depth),
              y: useTransform(particleY, (y) => y * particle.depth),
              scale: useTransform(
                [smoothMouseX, smoothMouseY],
                ([x, y]: number[]) => {
                  const centerX = window.innerWidth / 2;
                  const centerY = window.innerHeight / 2;
                  const distance = Math.sqrt(
                    (x - centerX) ** 2 + (y - centerY) ** 2
                  );
                  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
                  return 0.8 + (distance / maxDistance) * 0.4 * particle.depth;
                }
              ),
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
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Educational pattern overlay with 3D tilt */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          rotateX: rotateX1,
          rotateY: rotateY1,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-white/8" />
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3Cpattern id='educational' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3C!-- Book icon --%3E%3Crect x='6' y='8' width='12' height='15' fill='none' stroke='white' stroke-width='0.8' opacity='0.4'/%3E%3Cline x1='8' y1='12' x2='16' y2='12' stroke='white' stroke-width='0.6' opacity='0.3'/%3E%3Cline x1='8' y1='15' x2='16' y2='15' stroke='white' stroke-width='0.6' opacity='0.3'/%3E%3Cline x1='8' y1='18' x2='14' y2='18' stroke='white' stroke-width='0.6' opacity='0.3'/%3E%3C!-- Graduation cap --%3E%3Cpolygon points='24,6 32,9 24,12 16,9' fill='none' stroke='white' stroke-width='0.8' opacity='0.4'/%3E%3Cline x1='32' y1='9' x2='32' y2='15' stroke='white' stroke-width='0.6' opacity='0.3'/%3E%3Ccircle cx='32' cy='15' r='1.2' fill='white' opacity='0.25'/%3E%3C!-- Pencil --%3E%3Cline x1='2' y1='28' x2='12' y2='38' stroke='white' stroke-width='1' opacity='0.4'/%3E%3Cpolygon points='1,27 4,30 2,32 0,29' fill='white' opacity='0.3'/%3E%3C!-- Mathematical symbols --%3E%3Ctext x='26' y='32' font-family='serif' font-size='6' fill='white' opacity='0.25'%3E∑%3C/text%3E%3Ctext x='6' y='32' font-family='serif' font-size='5' fill='white' opacity='0.25'%3Eπ%3C/text%3E%3Ctext x='32' y='25' font-family='serif' font-size='4' fill='white' opacity='0.2'%3E∫%3C/text%3E%3C!-- Note/document --%3E%3Crect x='22' y='24' width='10' height='12' fill='none' stroke='white' stroke-width='0.8' opacity='0.4'/%3E%3Cline x1='24' y1='27' x2='30' y2='27' stroke='white' stroke-width='0.4' opacity='0.3'/%3E%3Cline x1='24' y1='30' x2='30' y2='30' stroke='white' stroke-width='0.4' opacity='0.3'/%3E%3Cline x1='24' y1='33' x2='28' y2='33' stroke='white' stroke-width='0.4' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23educational)'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>

      {/* Ambient glow effects with mouse interaction */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          style={{
            x: useTransform(orbX, (x) => x * 0.3),
            y: useTransform(orbY, (y) => y * 0.3),
            scale: useTransform(
              [smoothMouseX, smoothMouseY],
              ([x, y]: number[]) => {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const distance = Math.sqrt(
                  (x - centerX) ** 2 + (y - centerY) ** 2
                );
                const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
                return 1 + (distance / maxDistance) * 0.5;
              }
            ),
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          style={{
            x: useTransform(orbX, (x) => x * -0.4),
            y: useTransform(orbY, (y) => y * -0.4),
            scale: useTransform([smoothMouseX, smoothMouseY], ([x, y]) => {
              const centerX = window.innerWidth / 2;
              const centerY = window.innerHeight / 2;
              const distance = Math.sqrt(
                ((x as number) - centerX) ** 2 + ((y as number) - centerY) ** 2
              );
              const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
              return 1.2 - (distance / maxDistance) * 0.4;
            }),
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl"
          style={{
            x: useTransform(orbX, (x) => x * 0.2),
            y: useTransform(orbY, (y) => y * 0.2),
            rotateX: rotateX2,
            rotateY: rotateY2,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </div>

      {/* Subtle noise texture for depth with 3D tilt */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          rotateX: rotateX1,
          rotateY: rotateY1,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>

      {/* Academic grid pattern with subtle 3D movement */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          x: useTransform(particleX, (x) => x * 0.1),
          y: useTransform(particleY, (y) => y * 0.1),
          rotateX: rotateX1,
          rotateY: rotateY1,
        }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </motion.div>

      {/* Floating academic icons with enhanced 3D interaction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`academic-${i}`}
            className="absolute text-white/25 drop-shadow-lg"
            style={{
              fontSize: `${40 + Math.random() * 30}px`,
              textShadow: "0 0 20px rgba(255,255,255,0.3)",
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 15 + Math.random() * 25,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            {["📝", "📄", "📋", "📝", "📄", "📋", "📝", "📄"][i]}
          </motion.div>
        ))}
      </div>

      {/* Interactive depth indicators (subtle visual cues) */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`depth-${i}`}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              x: useTransform(particleX, (x) => x * (i + 1) * 0.05),
              y: useTransform(particleY, (y) => y * (i + 1) * 0.05),
              scale: useTransform(
                [smoothMouseX, smoothMouseY],
                ([x, y]: number[]) => {
                  const centerX = window.innerWidth / 2;
                  const centerY = window.innerHeight / 2;
                  const distance = Math.sqrt(
                    (x - centerX) ** 2 + (y - centerY) ** 2
                  );
                  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
                  return 0.5 + (distance / maxDistance) * 1.5;
                }
              ),
              opacity: useTransform(
                [smoothMouseX, smoothMouseY],
                ([x, y]: number[]) => {
                  const centerX = window.innerWidth / 2;
                  const centerY = window.innerHeight / 2;
                  const distance = Math.sqrt(
                    (x - centerX) ** 2 + (y - centerY) ** 2
                  );
                  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
                  return 0.1 + (distance / maxDistance) * 0.4;
                }
              ),
            }}
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Mouse follower (subtle cursor enhancement) */}
      <motion.div
        className="fixed pointer-events-none w-6 h-6 bg-white/20 rounded-full blur-sm mix-blend-screen"
        style={{
          x: useTransform(smoothMouseX, (x) => x - 12),
          y: useTransform(smoothMouseY, (y) => y - 12),
          scale: useTransform(
            [smoothMouseX, smoothMouseY],
            ([x, y]: number[]) => {
              const velocity = Math.sqrt(x ** 2 + y ** 2);
              return Math.min(1 + velocity * 0.0001, 2);
            }
          ),
        }}
      />

      {/* Content container with enhanced backdrop and 3D interaction */}
      <motion.div
        className="relative min-h-screen"
        style={{
          rotateX: useTransform(rotateX1, (rot) => rot * 0.1),
          rotateY: useTransform(rotateY1, (rot) => rot * 0.1),
          transformStyle: "preserve-3d",
        }}
      >
        <div className="w-full min-h-screen bg-transparent backdrop-blur-[0.5px]">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

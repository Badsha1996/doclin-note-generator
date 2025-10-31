import * as React from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

export default function BackgroundLayout({ children }: BackgroundLayoutProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Detect mobile devices
  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < 1024;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ALWAYS call hooks - adjust parameters based on isMobile
  const smoothMouseX = useSpring(mouseX, { 
    stiffness: isMobile ? 0 : 40, 
    damping: isMobile ? 0 : 30 
  });
  const smoothMouseY = useSpring(mouseY, { 
    stiffness: isMobile ? 0 : 40, 
    damping: isMobile ? 0 : 30 
  });

  // ALWAYS call useTransform - adjust values based on isMobile
  const rotateX1 = useTransform(
    smoothMouseY,
    [0, typeof window !== 'undefined' ? window.innerHeight : 1000],
    isMobile ? [0, 0] : [1.5, -1.5]
  );
  const rotateY1 = useTransform(
    smoothMouseX,
    [0, typeof window !== 'undefined' ? window.innerWidth : 1000],
    isMobile ? [0, 0] : [-1.5, 1.5]
  );

  // ALWAYS call useTransform for content rotation
  const contentRotateX = useTransform(rotateX1, (rot) => (rot as number) * 0.1);
  const contentRotateY = useTransform(rotateY1, (rot) => (rot as number) * 0.1);

  // Memoize particles with consistent hook calls
  const particles = React.useMemo(
    () =>
      Array.from({ length: isMobile ? 15 : 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 20,
        depth: Math.random() * 0.5 + 0.5,
      })),
    [isMobile]
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile) {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-full overflow-hidden"
      style={{ perspective: isMobile ? "none" : "1000px" }}
    >
      {/* Background gradient */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={isMobile ? {} : {
          rotateX: rotateX1,
          rotateY: rotateY1,
          transformStyle: "preserve-3d",
        }}
      />

      {/* Secondary gradient */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-tr from-cyan-600/20 via-transparent to-pink-500/20"
        animate={isMobile ? {} : {
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
      />

      {/* Orbs - conditionally rendered but no hooks inside */}
      {!isMobile && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute w-32 h-32 rounded-full blur-xl"
              style={{
                background: [
                  "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)",
                ][i],
              }}
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
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
      )}

      {/* Particles */}
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
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Educational pattern - only on desktop */}
      {!isMobile && (
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
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3Cpattern id='educational' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Crect x='6' y='8' width='12' height='15' fill='none' stroke='white' stroke-width='0.8' opacity='0.4'/%3E%3Cline x1='8' y1='12' x2='16' y2='12' stroke='white' stroke-width='0.6' opacity='0.3'/%3E%3Cline x1='8' y1='15' x2='16' y2='15' stroke='white' stroke-width='0.6' opacity='0.3'/%3E%3Cline x1='8' y1='18' x2='14' y2='18' stroke='white' stroke-width='0.6' opacity='0.3'/%3E%3Cpolygon points='24,6 32,9 24,12 16,9' fill='none' stroke='white' stroke-width='0.8' opacity='0.4'/%3E%3Cline x1='32' y1='9' x2='32' y2='15' stroke='white' stroke-width='0.6' opacity='0.3'/%3E%3Ccircle cx='32' cy='15' r='1.2' fill='white' opacity='0.25'/%3E%3Cline x1='2' y1='28' x2='12' y2='38' stroke='white' stroke-width='1' opacity='0.4'/%3E%3Cpolygon points='1,27 4,30 2,32 0,29' fill='white' opacity='0.3'/%3E%3Ctext x='26' y='32' font-family='serif' font-size='6' fill='white' opacity='0.25'%3E∑%3C/text%3E%3Ctext x='6' y='32' font-family='serif' font-size='5' fill='white' opacity='0.25'%3Eπ%3C/text%3E%3Ctext x='32' y='25' font-family='serif' font-size='4' fill='white' opacity='0.2'%3E∫%3C/text%3E%3Crect x='22' y='24' width='10' height='12' fill='none' stroke='white' stroke-width='0.8' opacity='0.4'/%3E%3Cline x1='24' y1='27' x2='30' y2='27' stroke='white' stroke-width='0.4' opacity='0.3'/%3E%3Cline x1='24' y1='30' x2='30' y2='30' stroke='white' stroke-width='0.4' opacity='0.3'/%3E%3Cline x1='24' y1='33' x2='28' y2='33' stroke='white' stroke-width='0.4' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23educational)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      )}

      {/* Ambient glows */}
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
            ease: "easeInOut",
          }}
        />
        {!isMobile && (
          <>
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
                delay: 3,
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
                delay: 1.5,
              }}
            />
          </>
        )}
      </div>

      {/* Noise texture - only on desktop */}
      {!isMobile && (
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
      )}

      {/* Grid pattern */}
      <div className="fixed inset-0 pointer-events-none">
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
      </div>

      {/* Floating icons - reduced for mobile */}
      {!isMobile && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`academic-${i}`}
              className="absolute text-white/25 drop-shadow-lg"
              style={{
                fontSize: `${40 + Math.random() * 30}px`,
                textShadow: "0 0 20px rgba(255,255,255,0.3)",
              }}
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                rotate: Math.random() * 360,
              }}
              animate={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 15 + Math.random() * 25,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              {["📝", "📄", "📋", "📝"][i]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Content container */}
      <motion.div
        className="relative min-h-screen"
        style={isMobile ? {} : {
          rotateX: contentRotateX,
          rotateY: contentRotateY,
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
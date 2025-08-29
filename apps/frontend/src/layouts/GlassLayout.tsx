import React from "react";

interface GlassLayoutProps {
  children: React.ReactNode;
}
export default function GlassLayout({ children }: GlassLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/10 via-purple-900/10 to-slate-900/10 p-4 relative overflow-hidden">
      <div className="relative">
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl blur-xl scale-110"></div>

        {/* Main glass panel */}
        <div
          className="mx-2 rounded-xl p-4 md:p-6 relative overflow-hidden  shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)",
          }}
        >
          {/* Inner glass reflection layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-400/5 via-transparent to-purple-400/5 rounded-xl"></div>

          {/* Glossy edge highlights */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-transparent via-white/60 to-transparent"></div>
          <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>

          {/* Corner reflections */}
          <div className="absolute top-3 left-3 w-12 h-12 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-md"></div>
          <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-bl from-white/5 to-transparent rounded-full blur-sm"></div>

          {/* Inner content area with subtle glass texture */}
          <div className="relative z-10 backdrop-blur-none bg-transparent rounded-lg border border-white/15 p-6 min-h-64">
            {/* Prismatic light refraction effect */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-cyan-300/60 via-blue-300/40 to-purple-300/60 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-tr from-purple-300/50 via-pink-300/30 to-blue-300/50 rounded-full blur-lg animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>

            <div className="relative z-100">{children}</div>

            {/* Subtle internal reflections */}
            <div className="absolute inset-2 bg-gradient-to-br from-white/8 via-transparent to-blue-400/5 rounded-md pointer-events-none"></div>
          </div>

          {/* Surface imperfections for realism */}
          <div className="absolute top-8 left-12 w-2 h-2 bg-white/10 rounded-full blur-sm opacity-70"></div>
          <div className="absolute top-16 right-8 w-1 h-1 bg-white/10 rounded-full opacity-60"></div>
          <div className="absolute bottom-12 left-8 w-3 h-3 bg-white/10 rounded-full blur-sm opacity-50"></div>
        </div>
      </div>
    </div>
  );
}

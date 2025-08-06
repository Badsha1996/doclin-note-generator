export default function BubbleBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-bubble"
          style={{
            width: Math.random() * 50 + 20 + "px",
            height: Math.random() * 50 + 20 + "px",
            left: Math.random() * 100 + "%",
            bottom: -Math.random() * 100 + "px",
            animationDelay: Math.random() * 10 + "s",
            animationDuration: 10 + Math.random() * 10 + "s",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: `
              0 0 10px rgba(224, 170, 255, 0.5),
              0 0 20px rgba(224, 170, 255, 0.3),
              0 0 30px rgba(255, 255, 255, 0.15)
            `,
            backdropFilter: "blur(4px)",
            borderRadius: "9999px",
          }}
        />
      ))}

      {/* Ultra subtle glass overlay */}
      <div
        className="absolute inset-0 z-5 pointer-events-none"
        style={{
          backdropFilter: "blur(60px)",
          WebkitBackdropFilter: "blur(60px)",
          mixBlendMode: "overlay",
          opacity: 0.25,
        }}
      />
    </div>
  );
}

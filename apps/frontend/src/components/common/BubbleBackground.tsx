export default function BubbleBackground() {
  const palette = [
    "rgba(12, 17, 31, 0.4)",
    "rgba(182, 101, 112, 0.35)",
    "rgba(81, 47, 92, 0.3)",
    "rgba(237, 158, 111, 0.25)",
    "rgba(45, 31, 68, 0.25)",
    "rgba(128, 70, 110, 0.2)",
  ];

  return (
    <>
     
      <div className="absolute inset-0 z-1 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => {
          const color = palette[Math.floor(Math.random() * palette.length)];
          return (
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
                backgroundColor: color,
                border: `1px solid ${color.replace("0.", "0.15")}`,
                boxShadow: `
                0 0 10px ${color.replace("0.", "0.5")},
                0 0 20px ${color.replace("0.", "0.3")},
                0 0 30px rgba(255, 255, 255, 0.12)
              `,
                backdropFilter: "blur(4px)",
                borderRadius: "9999px",
              }}
            />
          );
        })}
      </div>
    
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import doclinImg from "@/assets/doclin.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";

export const Route = createFileRoute("/login/")({
  component: Login,
});

 function Login() {
  const [showEmailInput, setShowEmailInput] = React.useState(false);
  const [email, setEmail] = React.useState("");
 const [detail, setDetail] = useState(null);

  useEffect(() => {
    const loginData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "sanyagarg111@gmail.com",
            username: "sanu",
            password: "sanu@123",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to register");
        }

        const data = await response.json();
        setDetail(data);
        console.log("✅ Registration successful:", data);
      } catch (error) {
        console.error("❌ Error during registration:", error);
      }
    };

    loginData();
  }, []);
  return (
      <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#3a0067] via-[#240046] to-[#18002B]">
  {/* Bubble Layer */}
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

  {/* Ultra subtle glass overlay (optional) */}
  <div
    className="absolute inset-0 z-5 pointer-events-none"
    style={{
      backdropFilter: "blur(60px)",
      WebkitBackdropFilter: "blur(60px)",
      mixBlendMode: "overlay",
      opacity: 0.25,
    }}
  />
      {/* 🟣 Glassmorphism Login Card */}

      <Card
        className="
    w-96 max-w-[90%]
    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
   bg-white/2 backdrop-blur-[90px]
    shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_40px_rgba(0,0,0,0.4)]
    rounded-[20px] p-8 text-white z-999 
    transition-all duration-300 border-none"
      >
        <CardHeader>
          <img src={doclinImg} alt="Doclin Logo" className="w-8 h-8 mx-auto" />
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Doclin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="submit" className="w-full">
            Continue with Google
          </Button>
          {!showEmailInput ? (
            <Button
              variant="vibe"
              className="w-full text-black"
             onClick={() => {
  console.log("Button clicked"); // <-- Add this
  setShowEmailInput(true);
}}
            >
              Continue with Email
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                type="email"
                className="w-full px-4 py-2 rounded bg-white/80 text-black focus:outline-none"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
</div>

    </div>
  );
}


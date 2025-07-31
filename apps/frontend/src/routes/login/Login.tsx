import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import doclinImg from "@/assets/doclin.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [showEmailInput, setShowEmailInput] = React.useState(false);
  const [email, setEmail] = React.useState("");

  return (
    <div
      className="w-screen h-screen relative overflow-hidden"
      style={{ backgroundColor: "#240046" }}
    >
      {/* 🔵 Inline Animated SVG Bubbles Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/20 animate-bubble"
            style={{
              width: `${Math.random() * 40 + 20}px`, // 20–60px
              height: `${Math.random() * 40 + 20}px`,
              left: `${Math.random() * 100}%`,
              bottom: `-${Math.random() * 100}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              borderColor: "#E0AAFF50", // semi-transparent lavender
              boxShadow: "0 0 6px rgba(224,170,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* 🟣 Glassmorphism Login Card */}

      <Card
        className="
    w-96 max-w-[90%]
    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
   bg-white/2 backdrop-blur-[90px]
    shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_40px_rgba(0,0,0,0.4)]
    rounded-[20px] p-8 text-white z-10
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
              variant="outline"
              className="w-full text-black"
              onClick={() => setShowEmailInput(true)}
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
  );
}

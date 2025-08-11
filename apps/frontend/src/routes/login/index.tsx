import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import doc from "@/assets/doc.png";
import BubbleBackground from "@/components/common/BubbleBackground";
import { FcGoogle } from "react-icons/fc";
import { BsMeta } from "react-icons/bs";
export const Route = createFileRoute("/login/")({
  component: Login,
});

function Login() {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const handleOAuth = (e: React.MouseEvent<HTMLButtonElement>) => {
    const provider = e.currentTarget.name as "google" | "meta";
    const url =
      provider === "meta"
        ? `https://www.facebook.com/v20.0/dialog/oauth?` +
          new URLSearchParams({
            client_id: import.meta.env.VITE_META_ID,
            redirect_uri: import.meta.env.VITE_REDIRECT_URI,
            response_type: "code",
            scope: "email,public_profile", // FB scopes
            state: "meta",
          })
        : `https://accounts.google.com/o/oauth2/v2/auth?` +
          new URLSearchParams({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            redirect_uri: import.meta.env.VITE_REDIRECT_URI,
            response_type: "code",
            scope: "openid email profile",
            state: "google",
          });

    window.location.href = url;
  };
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#3a0067] via-[#240046] to-[#18002B]">
      {/* === Bubble Background (non-interactive) === */}
      <BubbleBackground />

      {/* === Interactive Login Card (on top, with pointer events enabled) === */}
      <Card
        className="
          w-96 max-w-[90%]
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white/2 backdrop-blur-[90px]
          shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_40px_rgba(0,0,0,0.4)]
          rounded-[20px] p-8 text-white
          transition-all duration-300 border-none z-10
        "
      >
        <CardHeader>
          <img src={doc} className="w-8 h-8 mx-auto" />
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Doclin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            name="google"
            className="w-full flex items-center gap-3  bg-blue-600 hover:bg-blue-700"
            onClick={handleOAuth}
          >
            <FcGoogle />
            <span>Sign in with Google</span>
          </Button>

          {/* Meta Continue */}
          <Button
            name="meta"
            className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleOAuth}
          >
            <BsMeta color="#0081FB" />
            <span>Continue with Meta</span>
          </Button>
          {!showEmailInput ? (
            <Button
              variant="vibe"
              className="w-full text-black"
              onClick={() => {
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
  );
}

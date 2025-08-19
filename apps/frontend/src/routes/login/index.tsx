import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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
    <div className="relative w-screen h-screen overflow-hidden">
      <BubbleBackground />

      <Card className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg p-5 sm:p-6 border-none">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white text-center">
          LOGIN
        </h2>
        <CardContent className="space-y-4">
          <Button
            name="google"
            className="w-full flex items-center gap-3"
            onClick={handleOAuth}
          >
            <FcGoogle />
            <span>Sign in with Google</span>
          </Button>
          <Button
            name="meta"
            className="w-full flex items-center gap-3 text-white"
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

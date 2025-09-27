import {
  createFileRoute,
  Link,
  useRouter,
  redirect,
} from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { LoginFormSchema, type loginTypes } from "@/types/type";
import {
  loginResponseSchema,
  type LoginResponse,
  type ApiError,
} from "@/types/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiMutation } from "@/hook/useApi";
import { toast } from "sonner";

import { FcGoogle } from "react-icons/fc";
import { BsMeta } from "react-icons/bs";
import { motion } from "framer-motion";

import { fadeInUp, scaleIn, transition } from "@/lib/motion";
import { setUserInfo, getUserInfo } from "@/lib/auth";

export const Route = createFileRoute("/login/")({
  beforeLoad: () => {
    if (getUserInfo()) {
      throw redirect({ to: "/", search: { oauth: undefined } });
    }
  },
  component: Login,
});

function Login() {
  const router = useRouter();
  // *************** All States **************
  const [showEmailInput, setShowEmailInput] = useState(false);

  // ********** Hooks *************
  const form = useForm<loginTypes>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // *********** API Hook **************
  const mutation = useApiMutation<LoginResponse, loginTypes>(
    {
      endpoint: "/auth/login",
      method: "POST",
      payloadSchema: LoginFormSchema,
      responseSchema: loginResponseSchema,
    },
    {
      onSuccess: (data) => {
        const { user } = data.data;
        setUserInfo({
          email: user.email,
          role: user.role,
          username: user.username,
        });
        toast.success(data.message || "Login successful!");
        router.navigate({ to: "/", search: { oauth: undefined } });
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Login failed. Please try again.");
        console.log(error);
      },
    }
  );

  // ********** Functions ***********
  function onSubmit(data: loginTypes) {
    mutation.mutate(data);
  }

  const handleOAuth = (e: React.MouseEvent<HTMLButtonElement>) => {
    const provider = e.currentTarget.name as "google" | "meta";
    const url =
      provider === "meta"
        ? `https://www.facebook.com/v20.0/dialog/oauth?` +
          new URLSearchParams({
            client_id: import.meta.env.VITE_META_ID,
            redirect_uri: import.meta.env.VITE_REDIRECT_URI,
            response_type: "code",
            scope: "email,public_profile",
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
    <div className="relative w-full h-screen flex justify-center items-center overflow-hidden">
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        transition={transition}
        className="flex justify-center items-center w-full"
      >
        <Card className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg p-5 sm:p-6 border-none">
          <motion.img
            src="/images/doclinIcon.png"
            alt="Doclin Logo"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <motion.h2
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={transition}
            className="text-2xl sm:text-3xl font-bold mb-6 text-white text-center"
          >
            Login
          </motion.h2>

          <CardContent className="space-y-4">
            {/*************** OAuth Buttons ***************/}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                name="google"
                className="w-full flex items-center gap-3"
                variant={"standOut"}
                onClick={handleOAuth}
              >
                <FcGoogle size={20} />
                <span>Sign in with Google</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                name="meta"
                className="w-full flex items-center gap-3 text-white"
                variant={"lavender"}
                onClick={handleOAuth}
              >
                <BsMeta size={20} color="#0081FB" />
                <span>Continue with Meta</span>
              </Button>
            </motion.div>
            {!showEmailInput ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="vibe"
                  className="w-full text-black bg-white/90 hover:bg-white"
                  onClick={() => setShowEmailInput(true)}
                >
                  Continue with Email
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-3"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={transition}
              >
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  <Input
                    type="text"
                    variant="custom"
                    placeholder="Email or Username"
                    {...form.register("email")}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                  <Input
                    type="password"
                    variant="custom"
                    placeholder="Enter your password"
                    {...form.register("password")}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    variant="standOut"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Logging in..." : "Continue"}
                  </Button>
                </form>
              </motion.div>
            )}

            <p className="text-sm text-gray-300 mt-6 text-center">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Login;

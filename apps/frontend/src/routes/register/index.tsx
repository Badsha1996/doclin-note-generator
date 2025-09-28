import {
  createFileRoute,
  Link,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormSchema,
  otpFormSchema,
  otpVerifySchema,
  verifyUserSchema,
  type OtpFormType,
  type OtpVerifyType,
  type registerTypes,
  type VerifyUserType,
} from "@/types/type";
import type {
  ApiError,
  GenerateOTPResponse,
  RegisterResponse,
  VerifyOTPResponse,
  VerifyUserResponse,
} from "@/types/api";
import {
  generateOTPResponseSchema,
  registerResponseSchema,
  verifyOTPResponseSchema,
  VerifyUserResponseSchema,
} from "@/types/api";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { motion } from "framer-motion";
import {
  fadeInLeft,
  fadeInUp,
  scaleIn,
  transition,
  transitionSlow,
} from "@/lib/motion";
import { useApiMutation } from "@/hook/useApi";

import { EyeClosed, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { getUserInfo } from "@/lib/auth";

export const Route = createFileRoute("/register/")({
  beforeLoad: () => {
    if (getUserInfo()) {
      throw redirect({ to: "/" });
    }
  },
  component: Register,
});

type ApiResponse = RegisterResponse;

export function Register() {
  const form = useForm<registerTypes>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmpassword: "",
      otp: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const navigate = useNavigate();

  const profileMutation = useApiMutation<VerifyUserResponse, VerifyUserType>(
    {
      endpoint: "/auth/verify",
      method: "POST",
      payloadSchema: verifyUserSchema,
      responseSchema: VerifyUserResponseSchema,
    },
    {
      onSuccess: (data) => {
        toast.success(data.message || "User verified successfully!");
        navigate({ to: "/login" });
      },

      onError: (error: ApiError) => {
        toast.error(error.message || "Profile setup failed.");
      },
    }
  );
  const mutation = useApiMutation<
    ApiResponse,
    Omit<registerTypes, "confirmpassword" | "otp">
  >(
    {
      endpoint: "/auth/register",
      method: "POST",
      payloadSchema: FormSchema.omit({ confirmpassword: true, otp: true }),
      responseSchema: registerResponseSchema,
    },
    {
      onSuccess: (data) => {
        toast.success(data.message || "Registration successful!");
        profileMutation.mutate({
          id: data.data.user.id,
        });
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Registration failed. Please try again.");
      },
    }
  );

  const sendOtpMutation = useApiMutation<GenerateOTPResponse, OtpFormType>(
    {
      endpoint: "/otp/generate",
      method: "POST",
      payloadSchema: otpFormSchema,
      responseSchema: generateOTPResponseSchema,
    },
    {
      onSuccess: (data) => {
        toast.success(data.message || "OTP sent successfully!");
        setOtpSent(true);
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Failed to send OTP");
      },
    }
  );
  const verifyOtpMutation = useApiMutation<VerifyOTPResponse, OtpVerifyType>(
    {
      endpoint: "/otp/verify",
      method: "POST",
      payloadSchema: otpVerifySchema,
      responseSchema: verifyOTPResponseSchema,
    },
    {
      onSuccess: (data) => {
        toast.success(data.message || "OTP verified!");
        setOtpVerified(true);
        setOtpSent(false);
        form.setValue("otp", "");
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Invalid OTP, please try again.");
      },
    }
  );
  function onSubmit(data: registerTypes) {
    const { username, email, password } = data;
    mutation.mutate({ username, email, password });
  }
  function handleEditEmail() {
    setOtpSent(false);
    setOtpVerified(false);
    form.setValue("otp", "");
    form.setValue("email", "");
  }

  function showHidePassword() {
    setShowPassword(!showPassword);
  }
  function showHideConfirmPassword() {
    setConfirmPassword(!confirmPassword);
  }

  return (
    <div className="relative w-full h-screen flex justify-center items-center overflow-hidden">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitionSlow}
        className="flex w-full max-w-4xl min-h-[500px] rounded-2xl shadow-lg overflow-hidden bg-white/5 backdrop-blur-md border border-white/10"
        style={{ height: "auto" }}
      >
        <div className="hidden lg:flex flex-col w-1/2 bg-transparent text-white p-8 lg:p-14  items-center">
          <motion.img
            src="/images/doclinIcon.png"
            alt="Doclin Icon"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionSlow}
            className="w-16 h-16 lg:w-60 lg:h-46 object-contain"
          />
          <div className="flex flex-col justify-center flex-1">
            <motion.h1
              variants={fadeInLeft}
              transition={transitionSlow}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-left leading-tight"
            >
              Welcome!
            </motion.h1>
            <div className="w-10 h-[2px] bg-white/70 my-4 "></div>
            <motion.p
              variants={fadeInLeft}
              transition={transition}
              className="mb-8 text-sm sm:text-base text-white/80 text-left max-w-xs"
            >
              Doclin app for notes and question generation
            </motion.p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="standOut"
                className="px-6 py-2 w-full max-w-xs rounded-md font-semibold cursor-pointer"
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          whileHover="whileHover"
          transition={transition}
          className="flex w-full lg:w-1/2 justify-center items-center p-6 sm:p-8"
        >
          <Card className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg p-5 sm:p-6 border-none">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white text-center">
              Register
            </h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.log("❌ Validation errors:", errors);
                })}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your username"
                          variant="custom"
                          {...field}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!otpSent && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              variant="custom"
                              {...field}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/50 pr-10"
                              readOnly={otpVerified}
                              onBlur={() => {
                                if (otpVerified || !field.value || otpSent)
                                  return;
                                sendOtpMutation.mutate({
                                  email: field.value,
                                  username: form.getValues("username"),
                                });
                              }}
                            />
                            {sendOtpMutation.isPending && (
                              <div className="absolute inset-y-0 right-3 flex items-center">
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                              </div>
                            )}
                            {otpVerified && (
                              <span
                                className="text-primary hover:underline font-medium text-sm cursor-pointer inline-block"
                                onClick={handleEditEmail}
                              >
                                Edit Email?
                              </span>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {otpSent && !otpVerified && (
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Enter OTP</FormLabel>
                        <FormControl>
                          <div className="">
                            <InputOTP
                              maxLength={6}
                              {...field}
                              className="w-full"
                              onChange={(val) => {
                                field.onChange(val);
                                if (val.length === 6) {
                                  verifyOtpMutation.mutate({
                                    email: form.getValues("email"),
                                    otp: val,
                                  });
                                }
                              }}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot
                                  index={0}
                                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                />
                                <InputOTPSlot
                                  index={1}
                                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                />
                              </InputOTPGroup>
                              <InputOTPSeparator />
                              <InputOTPGroup>
                                <InputOTPSlot
                                  index={2}
                                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                />

                                <InputOTPSlot
                                  index={3}
                                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                />
                              </InputOTPGroup>
                              <InputOTPSeparator />
                              <InputOTPGroup>
                                <InputOTPSlot
                                  index={4}
                                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                />
                                <InputOTPSlot
                                  index={5}
                                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                />
                              </InputOTPGroup>
                            </InputOTP>
                            <span
                              className="text-primary hover:underline font-medium text-sm cursor-pointer inline-block"
                              onClick={handleEditEmail}
                            >
                              Edit Email?
                            </span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            type={showPassword ? "text" : "password"}
                            variant="custom"
                            placeholder="••••••••"
                            {...field}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                          />
                          <div className=" relative bottom-8 left-11/12 h-1 cursor-pointer">
                            {showPassword ? (
                              <Eye
                                className=" w-3"
                                onClick={showHidePassword}
                              />
                            ) : (
                              <EyeClosed
                                className="w-3"
                                onClick={showHidePassword}
                              />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmpassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            type={confirmPassword ? "text" : "password"}
                            variant="custom"
                            placeholder="••••••••"
                            {...field}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                          />
                          <div className=" relative bottom-8 left-11/12 h-1 cursor-pointer ">
                            {confirmPassword ? (
                              <Eye
                                className=" w-3"
                                onClick={showHideConfirmPassword}
                              />
                            ) : (
                              <EyeClosed
                                className="w-3"
                                onClick={showHideConfirmPassword}
                              />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex justify-center mt-2"
                >
                  <Button
                    type="submit"
                    variant="standOut"
                    className="w-full max-w py-2 rounded-md font-semibold cursor-pointer"
                    disabled={!otpVerified}
                  >
                    {mutation.isPending ? "Registering..." : "Register"}
                  </Button>
                </motion.div>

                <p className="text-sm text-gray-300 mt-4 text-center">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Login
                  </Link>
                </p>
              </form>
            </Form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

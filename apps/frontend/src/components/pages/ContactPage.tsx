import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FaWhatsapp } from "react-icons/fa";
import { Rating } from "@/components/common/Rating";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useApiMutation } from "@/hook/useApi";
import { useQueryClient } from "@tanstack/react-query";
import {
  feedbackApiSchema,
  reportDescriptionSchema,
  type FeedbackResponse,
} from "@/types/api";
import {
  feedbackFormPayloadSchema,
  reportFormSchema,
  type FeedbackFormValues,
  type ReportFormValues,
} from "@/types/type";
import { getUserInfo } from "@/lib/auth";
import { IoClose } from "react-icons/io5";
import { useRouter, useSearch } from "@tanstack/react-router";
import { Card } from "../ui/card";
import { fadeInUp, scaleIn, transition, transitionSlow } from "@/lib/motion";
const tabContent = {
  feedback: {
    title: "Rate Your Experience 📝",
    description:
      "Help us improve! Rate your experience and leave your comments so we can make our service even better.",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-15 h-15 drop-shadow-lg"
      >
        <defs>
          <linearGradient
            id="purpleGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        <path
          d="M476.59 3.11 17.73 212.63c-22.58 10.45-21.08 43.14 2.2 51.16l111.9 37.3 45.9 147.7c6.47 20.81 32.77 27.3 48.55 12.15l66.25-65.13 104.8 76.7c19.7 14.42 47.9 4.57 53.6-19.5l62.1-278.48c6.2-27.79-20.7-51.38-47.5-40.86zM195.6 422.63l-33.6-108 190.8-120.84-128.7 149.8-28.5 79.04z"
          fill="url(#purpleGradient)"
        />
      </svg>
    ),
    animation: { x: 300, y: -200, rotate: 45, opacity: 0 },
  },
  report: {
    title: "Report an Issue 🐞",
    description:
      "Found an issue? Let us know so we can fix it quickly and improve your experience.",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-15 h-15 drop-shadow-lg"
      >
        <defs>
          <linearGradient id="bugGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        <path
          fill="url(#bugGradient)"
          d="M256 0C114.836 0 0 114.836 0 256s114.836 256 256 256 256-114.836 256-256S397.164 0 256 0zm0 472c-119.103 0-216-96.897-216-216S136.897 40 256 40s216 96.897 216 216-96.897 216-216 216zm-12-324h24v120h-24V148zm0 168h24v24h-24v-24z"
        />
      </svg>
    ),
    animation: { x: -200, y: 150, rotate: -30, opacity: 0 },
  },
  "join-team": {
    title: "Join Our Team 🖇️",
    description:
      "Love what we do? Collaborate with us, contribute your skills, and help build something amazing together!",
    svg: (
      <svg
        viewBox="0 0 24 24"
        className="w-20 h-20 drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="joinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        <path
          d="M9 4A4 4 0 1 0 9 12 4 4 0 1 0 9 4z"
          fill="url(#joinGradient)"
        />
        <path
          d="m10,13h-2c-2.76,0-5,2.24-5,5v1c0,.55.45,1,1,1h10c.55,0,1-.45,1-1v-1c0-2.76-2.24-5-5-5Z"
          fill="url(#joinGradient)"
        />
        <path
          d="m15,4c-.47,0-.9.09-1.31.22.82,1.02,1.31,2.33,1.31,3.78s-.49,2.75-1.31,3.78c.41.13.84.22,1.31.22,2.28,0,4-1.72,4-4s-1.72-4-4-4Z"
          fill="url(#joinGradient)"
        />
        <path
          d="m16,13h-1.11c1.3,1.27,2.11,3.04,2.11,5v1c0,.35-.07.69-.18,1h3.18c.55,0,1-.45,1-1v-1c0-2.76-2.24-5-5-5Z"
          fill="url(#joinGradient)"
        />
      </svg>
    ),
    animation: { x: 0, y: 200, rotate: 15, opacity: 0 },
  },
};

function ContactPage() {
  // *************** All States ***************
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const search = useSearch({ from: "/contact/" });
  const [activeTab, setActiveTab] = useState<
    "feedback" | "report" | "join-team"
  >((search.tab as "feedback" | "report" | "join-team") || "feedback");

  useEffect(() => {
    if (search.tab) {
      setActiveTab(search.tab as "feedback" | "report" | "join-team");
    }
  }, [search.tab]);

  const [isFlying, setIsFlying] = useState(false);
  const router = useRouter();
  const feedbackForm = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormPayloadSchema),
    defaultValues: { rating: 3, feedback_text: "" },
  });
  const queryClient = useQueryClient();

  const reportForm = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      description: "",
      attachment: undefined,
    },
  });

  //*************** Hook API Calls ***************
  const feedbackMutation = useApiMutation<FeedbackResponse, FeedbackFormValues>(
    {
      endpoint: "/feedback/add",
      method: "POST",
      payloadSchema: feedbackFormPayloadSchema,
      responseSchema: feedbackApiSchema,
    },
    {
      onSuccess: () => {
        toast.success("Feedback submitted — thank you!");
        feedbackForm.reset();
        setIsFlying(true);
        setTimeout(() => setIsFlying(false), 1500);
        queryClient.invalidateQueries({ queryKey: ["/feedback/all", "GET"] });
      },
      onError: (error) => {
        console.error("Feedback submission failed:", error);
        toast.error("Failed to submit feedback. Please try again.");
        setIsFlying(true);
        setTimeout(() => setIsFlying(false), 1500);
      },
    }
  );

  const reportMutation = useApiMutation<{ message: string }, FormData>(
    {
      endpoint: "/issue/report",
      method: "POST",
    },
    {
      onSuccess: () => {
        toast.success("Issue reported. We'll look into it.");
        reportForm.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to submit the report. Please try again.");
      },
    }
  );

  // ***************  Functions ***************
  function onSubmitFeedback(data: FeedbackFormValues) {
    if (!getUserInfo()) {
      toast.error("You have to login first in order to send feedback");
      router.navigate({ to: "/login" });
      return;
    }
    const payload = {
      rating: data.rating,
      feedback_text: data.feedback_text?.trim()
        ? data.feedback_text.trim()
        : undefined,
    };
    feedbackMutation.mutate(payload);
  }

  function onSubmitReport(data: ReportFormValues) {
    if (!getUserInfo()) {
      toast.error("You have to login first in order to report an issue");
      router.navigate({ to: "/login" });
      return;
    }
    const descResult = reportDescriptionSchema.safeParse(data.description);
    if (!descResult.success) {
      reportForm.setError("description", {
        message: "Please describe the issue in more detail",
      });
      return;
    }

    const files = data.attachment as FileList | undefined;
    if (files?.length) {
      const maxSize = 5 * 1024 * 1024;
      if (files[0].size > maxSize) {
        toast.error("Attachment is too large (max 5MB)");
        return;
      }
    }

    const fd = new FormData();
    fd.append("description", data.description);
    if (files?.length) {
      fd.append("file", files[0]);
    }
    for (const [key, value] of fd.entries()) {
      console.log(key, value);
    }

    reportMutation.mutate(fd);
  }

  return (
    <div className="space-y-8 mt-24">
      <PageHeader
        title="Contact Us"
        subTitle="Have questions or feedback? We’re here to provide the right support for your learning needs."
      />
      <div className="relative w-full h-screen flex justify-center items-center overflow-hidden">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transitionSlow}
          className="flex w-full max-w-5xl min-h-[500px] rounded-2xl shadow-lg overflow-hidden bg-white/5 backdrop-blur-md border border-white/10"
          style={{ height: "auto" }}
        >
          <div className="hidden lg:flex flex-col w-1/2 bg-transparent text-white p-8 lg:p-14 mx-auto items-center justify-center">
            <h2 className="text-3xl font-bold mb-4">
              {tabContent[activeTab].title}
            </h2>
            <p className="text-white text-center mb-8">
              {tabContent[activeTab].description}
            </p>

            <motion.div
              key={activeTab + (isFlying ? "-flying" : "-resting")}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={
                isFlying
                  ? tabContent[activeTab].animation
                  : { x: 0, y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ duration: 1.2, ease: "easeInOut" }}
              onAnimationComplete={() => {
                if (isFlying) setIsFlying(false);
              }}
            >
              {tabContent[activeTab].svg}
            </motion.div>
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
              <div className="flex mb-6">
                <div className="inline-flex w-full rounded-2xl backdrop-blur-lg bg-[#6a1b9a]/20 border border-[#6a1b9a]/30 shadow-lg p-2 justify-between items-center">
                  <button
                    role="tab"
                    onClick={() => setActiveTab("feedback")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 
        ${activeTab === "feedback" ? "bg-white/10 text-white shadow-md" : "text-white hover:bg-[#6a1b9a]/30 hover:text-white"}`}
                  >
                    Feedback
                  </button>
                  <button
                    role="tab"
                    onClick={() => setActiveTab("report")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
        ${activeTab === "report" ? "bg-white/10 text-white shadow-md" : "text-white hover:bg-[#6a1b9a]/30 hover:text-white"}`}
                  >
                    Report an Issue
                  </button>
                  <button
                    role="tab"
                    onClick={() => setActiveTab("join-team")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
        ${activeTab === "join-team" ? "bbg-white/10 text-white shadow-md" : "text-white hover:bg-[#6a1b9a]/30 hover:text-white"}`}
                  >
                    Join Team
                  </button>
                </div>
              </div>
              <div>
                {activeTab === "feedback" && (
                  <Form {...feedbackForm}>
                    <form
                      onSubmit={feedbackForm.handleSubmit(onSubmitFeedback)}
                      className="space-y-6"
                    >
                      <FormField
                        control={feedbackForm.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="rating" className="text-white">
                              Rating
                            </FormLabel>
                            <FormControl>
                              <Rating
                                value={field.value ?? 3}
                                onChange={(val) => field.onChange(val)}
                              />
                            </FormControl>
                            <FormDescription className="text-slate-300">
                              Please provide your rating.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={feedbackForm.control}
                        name="feedback_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="feedback_text"
                              className="text-white"
                            >
                              Feedback
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share your experience..."
                                className="resize-none bg-white/10 border-white/30 placeholder:text-white/50"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-slate-300">
                              You can @mention other users and organizations.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center">
                        <Button
                          className=" text-white bg-indigo-500 hover:opacity-90 shadow-lg  transition-all duration-300 flex items-center gap-2"
                          type="submit"
                          disabled={
                            feedbackMutation.isPending ||
                            feedbackForm.formState.isSubmitting
                          }
                        >
                          {feedbackMutation.isPending ? (
                            <>
                              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Submitting...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </Button>

                        <div className="ml-4 text-sm text-slate-50">
                          Thank you — your feedback helps us improve.
                        </div>
                      </div>
                    </form>
                  </Form>
                )}

                {activeTab === "report" && (
                  <Form {...reportForm}>
                    <form
                      onSubmit={reportForm.handleSubmit(onSubmitReport)}
                      className="space-y-6"
                    >
                      <FormField
                        control={reportForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="description"
                              className="text-white"
                            >
                              Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the bug or issue..."
                                className="resize-none bg-white/10 border-white/30 placeholder:text-white/50"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-slate-300">
                              Please include steps to reproduce, expected vs
                              actual behavior, and any relevant URLs.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormItem>
                        <FormLabel>Attachment (optional)</FormLabel>
                        <FormControl>
                          <div className="flex flex-col space-y-2">
                            <input
                              type="file"
                              className="block w-50 text-sm text-slate-200 file:border-0 file:bg-white/10 file:py-2 file:px-3 file:rounded-md"
                              onChange={(e) => {
                                reportForm.setValue(
                                  "attachment",
                                  e.target.files
                                );
                              }}
                              aria-describedby="attachment-desc"
                              ref={fileInputRef}
                            />
                            {reportForm.watch("attachment")?.length > 0 && (
                              <div className="flex items-center justify-between bg-white/10 px-3 py-1 rounded-md text-sm">
                                <span className="truncate">
                                  {reportForm.watch("attachment")![0].name}
                                </span>

                                <IoClose
                                  onClick={() => {
                                    reportForm.setValue(
                                      "attachment",
                                      undefined
                                    );
                                    if (fileInputRef.current)
                                      fileInputRef.current.value = "";
                                  }}
                                  className="ml-2 text-white font-semibold"
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription
                          id="attachment-desc"
                          className="text-slate-300"
                        >
                          Screenshots or logs help us debug faster. Max 5MB.
                        </FormDescription>
                      </FormItem>
                      <div className="flex items-center">
                        <Button
                          type="submit"
                          className="text-white bg-purple-500 hover:opacity-90 shadow-lg  transition-all duration-300 flex items-center gap-2"
                          disabled={
                            reportMutation.isPending ||
                            reportForm.formState.isSubmitting
                          }
                        >
                          {reportMutation.isPending ? (
                            <>
                              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Reporting...
                            </>
                          ) : (
                            "Report Issue"
                          )}
                        </Button>

                        <div className="ml-4 text-sm text-slate-300">
                          We'll respond as soon as we can.
                        </div>
                      </div>
                    </form>
                  </Form>
                )}
                {activeTab === "join-team" && (
                  <div className="flex flex-col items-center justify-center space-y-4 p-6">
                    <h3 className="text-xl font-semibold">
                      Join Our Team on WhatsApp
                    </h3>
                    <p className="text-center text-slate-100">
                      Click the button below to join our team chat and start
                      collaborating!
                    </p>
                    <a
                      href="https://chat.whatsapp.com/FlZQTmQBK9EKuUSHg3JvPB?mode=ems_copy_t"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block font-semibold px-6 py-3 rounded-md bg-blue-500 text-white shadow-md 
             hover:opacity-90 transitionduration-300"
                    >
                      <FaWhatsapp className="inline mr-2 text-lg" />
                      Join WhatsApp Group
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default ContactPage;

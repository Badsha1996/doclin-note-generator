import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Rating } from "@/components/common/Rating";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useApiMutation } from "@/hook/useApi";
import { feedbackApiSchema, reportDescriptionSchema } from "@/types/api";
import {
  reportFormSchema,
  type FeedbackFormValues,
  type ReportFormValues,
} from "@/types/type";

export const Route = createFileRoute("/contact/")({
  component: RouteComponent,
});

function RouteComponent() {
  // *************** All States ***************
  const [activeTab, setActiveTab] = useState<"feedback" | "report">("feedback");
  const [isFlying, setIsFlying] = useState(false);

  const feedbackForm = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackApiSchema),
    defaultValues: { rating: 3, feedback: "" },
  });

  const reportForm = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      description: "",
      attachment: undefined,
    },
  });

  //*************** Hook API Calls ***************
  const feedbackMutation = useApiMutation<
    { message: string },
    z.infer<typeof feedbackApiSchema>
  >(
    {
      endpoint: "/feedback/add",
      method: "POST",
      payloadSchema: feedbackApiSchema,
    },
    {
      onSuccess: () => {
        toast.success("Feedback submitted — thank you!");
        feedbackForm.reset();
        setIsFlying(true);
        setTimeout(() => setIsFlying(false), 1500);
      },
      onError: (error) => {
        console.error(error);
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
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to submit the report. Please try again.");
      },
    }
  );

  // ***************  Functions ***************
  function onSubmitFeedback(data: FeedbackFormValues) {
    feedbackMutation.mutate({
      rating: data.rating,
      feedback_text: data.feedback || undefined,
    });
  }

  function onSubmitReport(data: ReportFormValues) {
    const descResult = reportDescriptionSchema.safeParse(data.description);
    if (!descResult.success) {
      reportForm.setError("description", {
        message: "Please describe the issue in more detail",
      });
      return;
    }

    const files = data.attachment as FileList | undefined;
    if (files?.length) {
      const maxSize = 10 * 1024 * 1024;
      if (files[0].size > maxSize) {
        toast.error("Attachment is too large (max 10MB)");
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
      <div className="relative flex justify-center items-center px-6 py-12">
        <div
          className="w-full max-w-4xl bg-white/70 backdrop-blur-md 
        shadow-xl grid md:grid-cols-2 rounded-xl
        overflow-hidden"
        >
          <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-400 text-white p-10 relative">
            <h2 className="text-3xl font-bold mb-4">Let’s Connect ✨</h2>
            <p className="text-white/80 text-center mb-8">
              Got feedback, questions, or just want to say hi? Drop us a message
              anytime!
            </p>
            <motion.div
              key={isFlying ? "flying" : "resting"}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={
                isFlying
                  ? { x: 300, y: -200, rotate: 45, opacity: 0 }
                  : { x: 0, y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ duration: 1.2, ease: "easeInOut" }}
              onAnimationComplete={() => {
                if (isFlying) setIsFlying(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-20 h-20 text-white drop-shadow-lg"
                fill="currentColor"
              >
                <path d="M476.59 3.11 17.73 212.63c-22.58 10.45-21.08 43.14 2.2 51.16l111.9 37.3 45.9 147.7c6.47 20.81 32.77 27.3 48.55 12.15l66.25-65.13 104.8 76.7c19.7 14.42 47.9 4.57 53.6-19.5l62.1-278.48c6.2-27.79-20.7-51.38-47.5-40.86zM195.6 422.63l-33.6-108 190.8-120.84-128.7 149.8-28.5 79.04z" />
              </svg>
            </motion.div>
          </div>
          <div className="bg-white p-8">
            <div className="mb-4 flex gap-2 text-xs text-slate-500 justify-end">
              {activeTab === "feedback" ? (
                <>
                  <span className="text-lg ">💬</span>
                  <span className="mt-1">Share quick feedback</span>
                </>
              ) : (
                <>
                  <span className="text-lg ">🐞</span>
                  <span className="mt-1">Report a bug or request</span>
                </>
              )}
            </div>
            {/* Tabs */}
            <div className="flex mb-6">
              <div className="inline-flex max-w-2xl rounded-lg border bg-slate-50 p-2 justify-between items-center">
                <button
                  role="tab"
                  onClick={() => setActiveTab("feedback")}
                  className={`px-3 py-1 rounded-md font-normal text-sm transition ${
                    activeTab === "feedback"
                      ? "bg-violet-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Feedback
                </button>
                <button
                  role="tab"
                  onClick={() => setActiveTab("report")}
                  className={`px-3 py-1 rounded-md font-normal text-sm transition ${
                    activeTab === "report"
                      ? "bg-violet-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Report an Issue
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
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <Rating
                              value={field.value ?? 3}
                              onChange={(val) => field.onChange(val)}
                            />
                          </FormControl>
                          <FormDescription>
                            Please provide your rating.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={feedbackForm.control}
                      name="feedback"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feedback</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share your experience..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            You can @mention other users and organizations.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center">
                      <Button
                        type="submit"
                        disabled={feedbackForm.formState.isSubmitting}
                      >
                        {feedbackForm.formState.isSubmitting
                          ? "Submitting..."
                          : "Submit"}
                      </Button>
                      <div className="ml-4 text-sm text-slate-500">
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reportForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reportForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the bug or issue..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
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
                        <input
                          type="file"
                          className="block w-full text-sm text-slate-700 file:border-0 file:bg-slate-100 file:py-2 file:px-3 file:rounded-md"
                          onChange={(e) => {
                            reportForm.setValue("attachment", e.target.files);
                          }}
                          aria-describedby="attachment-desc"
                        />
                      </FormControl>
                      <FormDescription id="attachment-desc">
                        Screenshots or logs help us debug faster. Max 10MB.
                      </FormDescription>
                    </FormItem>
                    <div className="flex items-center">
                      <Button
                        type="submit"
                        disabled={reportForm.formState.isSubmitting}
                      >
                        {reportForm.formState.isSubmitting
                          ? "Reporting..."
                          : "Report Issue"}
                      </Button>
                      <div className="ml-4 text-sm text-slate-500">
                        We'll respond as soon as we can.
                      </div>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

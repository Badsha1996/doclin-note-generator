import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useApiMutation } from "@/hook/useApi";
import { Textarea } from "@/components/ui/textarea";
import {
  examPaperUploadSchema,
  type ApiError,
  type ExamPaperUploadResponse,
} from "@/types/api";
import {
  ExamDocumentSchema,
  JsonInputSchema,
  type ExamDocument,
  type JsonInputForm,
} from "@/types/type";

function Syllabus() {
  const form = useForm<JsonInputForm>({
    resolver: zodResolver(JsonInputSchema),
    defaultValues: {
      json: "",
    },
  });

  const mutation = useApiMutation<ExamPaperUploadResponse, ExamDocument>(
    {
      endpoint: "/exam-paper/save",
      method: "POST",
      payloadSchema: ExamDocumentSchema,
      responseSchema: examPaperUploadSchema,
    },
    {
      onSuccess: () => {
        toast.success("submitted successfully!");
        form.reset();
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Registration failed. Please try again.");
      },
    }
  );
  function onSubmit(data: { json: string }) {
    const parsed = JSON.parse(data.json);
    const validated = ExamDocumentSchema.parse(parsed);
    mutation.mutate(validated);
  }

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="json"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Type your JSON here."
                    {...field}
                    className="bg-white border-slate-800/30 text-slate-800/50 h-[50svh] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end mt-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full max-w-xs py-2 rounded-md font-semibold backdrop-blur-md bg-[#e4558d]/70 border border-[#e4558d]/40 text-white hover:bg-[#e4558d]/80 shadow-lg transition-all duration-300"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating..." : "Submit"}
              </Button>
            </motion.div>
          </div>
        </form>
      </Form>
      {/* I’m so sleepy…Nyan🐈🐈” 😵‍💫🍵 */}
    </div>
  );
}

export default Syllabus;

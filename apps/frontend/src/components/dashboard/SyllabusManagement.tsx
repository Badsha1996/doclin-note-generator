import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [open, setOpen] = useState(false);

  const form = useForm<JsonInputForm>({
    resolver: zodResolver(JsonInputSchema),
    defaultValues: {
      json: "",
    },
  });
  function handleCloseDialog() {
    setOpen(false);
  }
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
        handleCloseDialog();
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Registration failed. Please try again.");
      },
    }
  );
  function onSubmit(data: { json: string }) {
    const parsed = JSON.parse(data.json); // parse first
    // optionally validate against ExamDocumentSchema
    const validated = ExamDocumentSchema.parse(parsed);
    mutation.mutate(validated);
  }

  return (
    <div className="">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button
            variant="standOut"
            className="relative overflow-hidden group shadow-lg ml-auto"
          >
            <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Add syllabus</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle className="text-slate-800 my-3">
              Add syllabus
            </DialogTitle>
            <DialogDescription>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="json"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Type your JSON here."
                            {...field}
                            className="bg-slate-800/20 border-slate-800/30 text-slate-800/50 h-52 resize-none"
                          />
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
                      className="w-full max-w-xs py-2 rounded-md font-semibold"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Creating..." : "Submit"}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      I’m so sleepy…Nyan🐈🐈” 😵‍💫🍵
    </div>
  );
}

export default Syllabus;

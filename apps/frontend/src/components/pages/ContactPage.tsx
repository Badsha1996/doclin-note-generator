import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import GlassLayout from "@/layouts/GlassLayout";

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

const formSchema = z.object({
  rating: z.number().min(0.5).max(5),
  feedback: z.string().optional(),
});

function ContactPage() {
  const [rating, setRating] = useState<number>(3);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 3,
      feedback: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className="space-y-8 mt-24">
      <PageHeader
        title="Contact Us"
        subTitle="Have questions or feedback? We’re here to provide the right support for your learning needs."
      />

      <GlassLayout>
        <div className="w-full flex">
          {/* <div className="w-full flex justify-end">
            <Button>Report Issue</Button>
          </div> */}
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 max-w-5xl mx-auto p-10 bg-white rounded-2xl"
              >
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start">
                      <FormLabel>Rating</FormLabel>
                      <FormControl className="w-full">
                        <Rating
                          value={field.value ?? rating}
                          onChange={(val) => {
                            setRating(val);
                            field.onChange(val);
                          }}
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
                  control={form.control}
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

                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </div>
        </div>
      </GlassLayout>
    </div>
  );
}

export default ContactPage;

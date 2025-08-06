import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import doc from "@/assets/doc.png";
import { FormSchema, type registerTypes } from "@/types/type";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import BubbleBackground from "@/components/common/BubbleBackground";

export const Route = createFileRoute("/register/")({
  component: Register,
});

export function Register() {
  const form = useForm<registerTypes>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmpassword: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.success("Registration successful!");
  }

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
           rounded-[20px] p-6 text-white
           transition-all duration-300 border-none z-10
         "
      >
        <CardHeader>
          <img src={doc} className="w-8 h-8 mx-auto" />
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Doclin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="UserName" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant="neonOutline" type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

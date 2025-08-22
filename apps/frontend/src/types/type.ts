import { z } from "zod";

// Register File Types
export const FormSchema = z
  .object({
    username: z.string().min(2, "Username must be at least 2 characters."),
    email: z.email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmpassword: z.string().min(6, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords do not match.",
    path: ["confirmpassword"], 
  });

export type registerTypes = z.infer<typeof FormSchema>;

// Login File Types
export const LoginFormSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type loginTypes = z.infer<typeof LoginFormSchema>;
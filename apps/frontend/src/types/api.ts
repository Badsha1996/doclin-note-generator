import { z } from "zod";

// Register Endpoint API Type
const userSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  role: z.literal("user"),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const apiResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: userSchema,
  }),
  message: z.string(),
});

type ApiResponse = z.infer<typeof apiResponseSchema>;

import { z } from "zod";

export interface ApiConfig<
  TResponse,
  TPayload = undefined
> {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number | boolean>;
  payload?: TPayload;
  responseSchema?: z.ZodSchema<TResponse>; 
  payloadSchema?: z.ZodSchema<TPayload>;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

// Register Endpoint API Type
export const userSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  role: z.literal("user"),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const apiResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: userSchema,
  }),
  message: z.string(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;

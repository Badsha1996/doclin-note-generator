import { z } from "zod";

export interface ApiConfig<TResponse, TPayload = undefined> {
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

// Base User Schema
export const userSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  role: z.literal("user"),
  is_verified: z.boolean(),
  plan: z.literal("free"),
  blocked: z.boolean(),
  model_hit_count: z.int32(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

//  Generic API response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(), // or z.literal(true) if always true
    data: dataSchema,
    message: z.string(),
  });

// Endpoint-specific "data" schemas

// Register Endpoint API Type
export const registerDataSchema = z.object({
  user: userSchema,
});

// Composed Endpoint Schemas
export const registerResponseSchema = apiResponseSchema(registerDataSchema);

//Inferred Types
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

// Login Endpoint API Type
export const loginDataSchema = z.object({
  user: userSchema,
  access_token: z.string(),
  refresh_token: z.string(),
});

export const loginResponseSchema = apiResponseSchema(loginDataSchema);

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const allUserDataSchema = z.object({
  users: z.array(userSchema),
});

export const allUserResponseSchema = apiResponseSchema(allUserDataSchema);

export type AllUserResponse = z.infer<typeof allUserResponseSchema>;

export const examPaperUploadSchema = apiResponseSchema(z.null());
export type ExamPaperUploadResponse = z.infer<typeof examPaperUploadSchema>;

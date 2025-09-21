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
  is_active: z.boolean(),
  is_verified: z.boolean(),
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

// Subject EndPoint Schema
export const subjectBoardSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const subjectResponseSchema = apiResponseSchema(
  z.object({
    exam_subjects: z.array(subjectBoardSchema),
  })
);

export type SubjectResponse = z.infer<typeof subjectResponseSchema>;

export const boardResponseSchema = apiResponseSchema(
  z.object({
    exam_boards: z.array(subjectBoardSchema),
  })
);

export type boardResponse = z.infer<typeof boardResponseSchema>;

// prev years
export const prevYearsResponseSchema = apiResponseSchema(
  z.object({
    prev_years: z.array(z.number()), // array of years
  })
);
export type PrevYearsResponse = z.infer<typeof prevYearsResponseSchema>;

// prev exam paper
export const prevExamPaperSchema = z.object({
  id: z.number(),
  subject: z.string(),
  year: z.number(),
  file_url: z.url(),
});

export const prevExamPaperResponseSchema = apiResponseSchema(
  z.object({
    exam_paper: prevExamPaperSchema.nullable(),
  })
);
export type PrevExamPaperResponse = z.infer<typeof prevExamPaperResponseSchema>;

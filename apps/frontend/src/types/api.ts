import { email, z } from "zod";

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
  role: z.enum(["admin", "user", "superAdmin"]),
  is_verified: z.boolean(),
  plan: z.enum(["free"]),
  blocked: z.boolean(),
  model_hit_count: z.int32(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type User = z.infer<typeof userSchema>;
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

export const OTPSchema = z.object({
  id: z.uuid(),
  email: email(),
  otp_hash: z.string(),
  created_at: z.coerce.date(),
  expires_at: z.coerce.date(),
});

export const generateOTPDataSchema = z.object({
  otp: OTPSchema,
});

export const generateOTPResponseSchema = apiResponseSchema(
  generateOTPDataSchema
);

export type GenerateOTPResponse = z.infer<typeof generateOTPResponseSchema>;
export const verifyOTPDataSchema = z.object({
  verified: z.boolean(),
  email: z.email(),
});
export const verifyOTPResponseSchema = apiResponseSchema(verifyOTPDataSchema);

export type VerifyOTPResponse = z.infer<typeof verifyOTPResponseSchema>;

export const verifyUserSchema = z.object({
  id: z.uuid(),
});
export const VerifyUserResponseSchema = apiResponseSchema(verifyUserSchema);
export type VerifyUserResponse = z.infer<typeof VerifyUserResponseSchema>;

export const examPaperUploadSchema = apiResponseSchema(z.null());
export type ExamPaperUploadResponse = z.infer<typeof examPaperUploadSchema>;

export const logoutSchema = apiResponseSchema(z.null());
export type LogoutResponse = z.infer<typeof logoutSchema>;

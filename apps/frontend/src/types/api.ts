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
    exam_subjects: z.array(z.string()),
  })
);

export type SubjectResponse = z.infer<typeof subjectResponseSchema>;

export const boardResponseSchema = apiResponseSchema(
  z.object({
    exam_boards: z.array(z.string()),
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

/* ---------------------------------- */
/* Shared Reusable Schemas            */
/* ---------------------------------- */

export const diagramSchema = z.object({
  type: z.string(),
  description: z.string(),
  elements: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  measurements: z.record(z.any(), z.any()).default({}), // safer than z.any()
  angles: z.record(z.any(), z.any()).default({}),
  instructions: z.string().nullable(),
});

export const optionSchema = z.object({
  option_letter: z.string(),
  text: z.string(),
});

export const subPartSchema = z.object({
  letter: z.string(),
  question_text: z.string(),
  marks: z.number().nullable(),
  diagram: diagramSchema.nullable(),
  formula_given: z.string().nullable(),
  constants_given: z.record(z.string(), z.string()).nullable(),
  equation_template: z.string().nullable(),
  choices_given: z.array(z.string()).nullable(),
});

export const partSchema = z.object({
  number: z.string(),
  type: z.enum([
    "multiple_choice",
    "short_answer",
    "calculation",
    "diagram_based",
    "complete_equation",
  ]),
  marks: z.number(),
  question_text: z.string().nullable(),
  description: z.string().nullable(),

  sub_parts: z.array(subPartSchema).default([]),
  options: z.array(optionSchema).default([]),
  diagram: diagramSchema.nullable(),

  formula_given: z.string().nullable(),
  constants_given: z.record(z.string(), z.string()).nullable(),

  column_a: z.array(z.string()).nullable(),
  column_b: z.array(z.string()).nullable(),

  items_to_arrange: z.array(z.string()).nullable(),
  sequence_type: z.string().nullable(),

  statement_with_blanks: z.string().nullable(),
  choices_for_blanks: z.array(z.string()).nullable(),

  equation_template: z.string().nullable(),
  missing_parts: z.array(z.string()).nullable(),
});

export const questionSchema = z.object({
  number: z.number(),
  title: z.string().nullable(),
  type: z.enum([
    "multiple_choice",
    "short_answer",
    "long_answer",
    "calculation",
    "diagram_based",
    "complete_equation",
  ]),
  total_marks: z.number(),
  instruction: z.string().nullable(),
  question_text: z.string().nullable(),

  parts: z.array(partSchema).default([]),
  options: z.array(optionSchema).default([]),
  diagram: diagramSchema.nullable(),
});

export const sectionSchema = z.object({
  name: z.string(),
  marks: z.number(),
  instruction: z.string(),
  is_compulsory: z.boolean(),
  questions: z.array(questionSchema),
});

/* ---------------------------------- */
/* Main Exam Paper Schema             */
/* ---------------------------------- */

// Updated schemas to match API response
export const examPaperSchema = z.object({
  exam: z.object({
    paper_code: z.string(),
    subject: z.string(),
    paper_name: z.string(),
    year: z.number(),
    board: z.string(),
    maximum_marks: z.number(),
    time_allowed: z.string(),
    reading_time: z.string(),
    additional_instructions: z.array(z.string()).default([]),
  }),
  sections: z.array(sectionSchema),
});

export const examPaperResponseSchema = apiResponseSchema(
  z.object({
    exam_paper: examPaperSchema,
  })
);

export type ExamPaper = z.infer<typeof examPaperSchema>;
export type ExamPaperResponse = z.infer<typeof examPaperResponseSchema>;

export const userKpiDataSchema = z.object({
  totalUsers: z.number(),
  blockedUsers: z.number(),
  paidUsers: z.number(),
  newUsers: z.number(),
  trend: z.array(z.record(z.string(), z.number())),
});

export const userKpiResponseSchema = apiResponseSchema(userKpiDataSchema);

export type UserKPIResponse = z.infer<typeof userKpiResponseSchema>;

//all use end point
export const allUserDataSchema = z.object({
  users: z.array(userSchema),
});

export const allUserResponseSchema = apiResponseSchema(allUserDataSchema);

export type AllUserResponse = z.infer<typeof allUserResponseSchema>;

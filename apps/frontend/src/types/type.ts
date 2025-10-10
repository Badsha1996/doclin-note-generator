import { z } from "zod";

// **************** Register File Types ****************
export const FormSchema = z
  .object({
    username: z.string().min(2, "Username must be at least 2 characters."),
    email: z.email("Invalid email address."),
    otp: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmpassword: z.string().min(6, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords do not match.",
    path: ["confirmpassword"],
  });

export type registerTypes = z.infer<typeof FormSchema>;

// **************** Login File Types ****************
export const LoginFormSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(6, "Please enter your password"),
});

export type loginTypes = z.infer<typeof LoginFormSchema>;

// **************** GlassDropdown File Types ****************

export const OptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
});

export type Options = z.infer<typeof OptionSchema>;

// exam  file upload  types
const DiagramSchema = z.object({
  type: z.string(),
  description: z.string(),
  elements: z.array(z.string()),
  labels: z.array(z.string()),
  measurements: z.record(z.any(), z.any()), // allows dynamic keys
  angles: z.object({
    additionalProp1: z.string().optional(),
    additionalProp2: z.string().optional(),
    additionalProp3: z.string().optional(),
  }),
  instructions: z.string(),
});

const SubPartSchema = z.object({
  letter: z.string(),
  question_text: z.string(),
  marks: z.number(),
  diagram: DiagramSchema,
  formula_given: z.string(),
  constants_given: z.record(z.any(), z.any()),
  equation_template: z.string(),
  choices_given: z.array(z.string()),
});

const PartSchema = z.object({
  number: z.string(),
  type: z.string(),
  marks: z.number(),
  question_text: z.string(),
  description: z.string(),
  sub_parts: z.array(SubPartSchema),
  options: z.array(
    z.object({
      option_letter: z.string(),
      text: z.string(),
    })
  ),
  diagram: DiagramSchema,
  formula_given: z.string(),
  constants_given: z.record(z.any(), z.any()),
  column_a: z.array(z.string()),
  column_b: z.array(z.string()),
  items_to_arrange: z.array(z.string()),
  sequence_type: z.string(),
  statement_with_blanks: z.string(),
  choices_for_blanks: z.array(z.array(z.string())),
  equation_template: z.string(),
  missing_parts: z.object({
    additionalProp1: z.string().optional(),
    additionalProp2: z.string().optional(),
    additionalProp3: z.string().optional(),
  }),
});

const Question = z.object({
  number: z.number(),
  title: z.string(),
  type: z.string(),
  total_marks: z.number(),
  instruction: z.string(),
  parts: z.array(PartSchema),
  question_text: z.string(),
  options: z.array(
    z.object({
      option_letter: z.string(),
      text: z.string(),
    })
  ),
  diagram: DiagramSchema,
});

const Section = z.object({
  name: z.string(),
  marks: z.number(),
  instruction: z.string(),
  is_compulsory: z.boolean(),
  questions: z.array(Question).min(1),
});

const ExamMeta = z.object({
  paper_code: z.string(),
  subject: z.string(),
  paper_name: z.string(),
  year: z.number().int(),
  board: z.string(),
  maximum_marks: z.number().nonnegative(),
  time_allowed: z.string(),
  reading_time: z.string(),
  additional_instructions: z.array(z.string()),
});

export const ExamDocumentSchema = z
  .object({
    exam: ExamMeta,
    sections: z.array(Section).min(1),
  })
  .strict();
export const JsonInputSchema = z.object({
  json: z.string().min(1, "JSON is required"),
});

/* --- TypeScript types inferred from the Zod schema --- */
export type ExamDocument = z.infer<typeof ExamDocumentSchema>;
export type QuestionType = z.infer<typeof Question>;
export type SectionType = z.infer<typeof Section>;
export type JsonInputForm = z.infer<typeof JsonInputSchema>;

export const otpFormSchema = z.object({
  email: z.email("Please enter a valid email"),
  username: z.string().optional(),
});

export type OtpFormType = z.infer<typeof otpFormSchema>;

export const otpVerifySchema = z.object({
  email: z.email("Please enter a valid email"),
  otp: z.string().length(6, "OTP must be 6 characters"),
});

export type OtpVerifyType = z.infer<typeof otpVerifySchema>;

export const verifyUserSchema = z.object({
  id: z.uuid(),
});
export type VerifyUserType = z.infer<typeof verifyUserSchema>;

// **************** Contact File Types ****************
export const feedbackFormPayloadSchema = z.object({
  rating: z.number().min(1, "Please Provide Rating").max(5),
  feedback_text: z.string().optional(),
});
export type FeedbackFormValues = z.infer<typeof feedbackFormPayloadSchema>;
export const reportFormSchema = z.object({
  description: z.string().min(10, "Please describe the issue in more detail"),
  attachment: z.any().optional(),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
export interface LeadContributorInfo {
  id: number;
  name: string;
  role: string;
  description: string;
  avatar: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

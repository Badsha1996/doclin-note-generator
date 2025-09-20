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

// exam  file upload  types

/* --- Subparts --- */
const SubpartWithOptions = z
  .object({
    sub_id: z.string(),
    question_text: z.string(),
    options: z.array(z.string()).min(1),
    // allow additional optional fields in future
  })
  .strict();

// subpart that may include tikz and optional options (for diagram questions)
const SubpartWithMaybeTikz = z
  .object({
    sub_id: z.string(),
    question_text: z.string(),
    options: z.array(z.string()).optional(),
    tikz: z.string().optional(),
  })
  .strict();

/* --- Base question fields --- */
const QuestionBase = z.object({
  number: z.number().int().nonnegative(),
  marks: z.number().nonnegative(),
  instruction: z.string().optional(), // optional based on sample (you had it present; make optional to be flexible)
});

/* --- Specific question variants (discriminated by `type`) --- */
const MCQQuestion = QuestionBase.extend({
  type: z.literal("MCQ"),
  subparts: z.array(SubpartWithOptions).min(1),
});

const FillReasoningQuestion = QuestionBase.extend({
  type: z.literal("Fill in the blanks + reasoning"),
  subparts: z.array(SubpartWithOptions).min(1),
});

const DiagramNumericalQuestion = QuestionBase.extend({
  type: z.literal("Diagram-based + Numericals"),
  // question-level optional tikz as in your sample
  tikz: z.string().optional(),
  subparts: z.array(SubpartWithMaybeTikz).min(1),
});

/* discriminated union of question types */
const Question = z.discriminatedUnion("type", [
  MCQQuestion,
  FillReasoningQuestion,
  DiagramNumericalQuestion,
]);

/* --- Section --- */
const Section = z.object({
  name: z.string(),
  marks: z.number().nonnegative(),
  questions: z.array(Question).min(1),
});

/* --- Exam meta --- */
const ExamMeta = z.object({
  board: z.string(),
  subject: z.string(),
  paper: z.string(),
  code: z.string(),
  year: z.number().int(),
  max_marks: z.number().nonnegative(),
  time_allowed: z.string(),
  instructions: z.array(z.string()),
  ai_generated: z.boolean(),
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

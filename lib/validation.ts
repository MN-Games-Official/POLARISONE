import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character'
    ),
  full_name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character'
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'short_answer', 'true_false']),
  text: z.string().min(1, 'Question text is required'),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().optional(),
  max_score: z.number().min(0),
  grading_criteria: z.string().optional(),
});

export const applicationSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  group_id: z.string().regex(/^\d+$/, 'Group ID must be a numeric string'),
  target_role: z.string().min(1, 'Target role is required'),
  pass_score: z.number().min(0).max(100),
  primary_color: z.string().min(1),
  secondary_color: z.string().min(1),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export const rankEntrySchema = z.object({
  id: z.string(),
  rank_id: z.number().min(0).max(255),
  gamepass_id: z.string(),
  name: z.string().min(1, 'Rank name is required'),
  description: z.string(),
  price: z.number().min(0),
  is_for_sale: z.boolean(),
  regional_pricing: z.record(z.number()).optional(),
});

export const rankCenterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  group_id: z.string().regex(/^\d+$/, 'Group ID must be a numeric string'),
  universe_id: z.string().optional(),
  ranks: z.array(rankEntrySchema),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().optional(),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character'
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const robloxApiKeySchema = z.object({
  api_key: z.string().min(1, 'API key is required'),
  validate: z.boolean().optional(),
});

export const polarisApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expires_in: z.string().optional(),
});

export const submissionSchema = z.object({
  app_id: z.string().uuid(),
  applicant_id: z.string().min(1, 'Applicant ID is required'),
  membership_id: z.string().optional(),
  answers: z.array(
    z.object({
      question_id: z.string(),
      answer: z.string(),
    })
  ),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type RankCenterInput = z.infer<typeof rankCenterSchema>;
export type RankEntryInput = z.infer<typeof rankEntrySchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RobloxApiKeyInput = z.infer<typeof robloxApiKeySchema>;
export type PolarisApiKeyInput = z.infer<typeof polarisApiKeySchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;

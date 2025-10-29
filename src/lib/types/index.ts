import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export enum AccessLevel {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  FULL = 'FULL',
}

export enum FormType {
  FORM = 'FORM',
  SURVEY = 'SURVEY',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum AnswerType {
  TEXT = 'TEXT',
  SINGLE_ANSWER = 'SINGLE_ANSWER',
  MULTIPLE_ANSWER = 'MULTIPLE_ANSWER',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export enum AnswerSubtype {
  TEXT_FIELD = 'text field',
  TEXTBOX = 'textbox',
  DATE = 'date',
  NUMBER = 'number',
  PHONE = 'phone',
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

// User schemas
export const signUpSchema = z.object({
  names: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  names: z.string().min(2).max(255).optional(),
  title: z.string().max(255).optional().nullable(),
  address: z.string().optional().nullable(),
  twitter: z.string().url().optional().nullable().or(z.literal('')),
  facebook: z.string().url().optional().nullable().or(z.literal('')),
  linkedin: z.string().url().optional().nullable().or(z.literal('')),
  about: z.string().optional().nullable(),
});

// Form schemas
export const createFormFieldSchema = z.object({
  field: z.string().min(1, 'Field name is required').max(255),
  answerType: z.nativeEnum(AnswerType),
  answerSubtype: z.string().max(50).optional().nullable(),
  required: z.boolean().default(false),
  placeholder: z.string().max(255).optional().nullable(),
  order: z.number().int().default(0),
  expectedAnswers: z.array(z.object({
    answer: z.string().min(1).max(255),
    order: z.number().int().default(0),
  })).optional(),
});

export const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  type: z.nativeEnum(FormType),
  description: z.string().optional().nullable(),
  fields: z.array(createFormFieldSchema).min(1, 'At least one field is required'),
});

export const updateFormSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(Status).optional(),
});

// Form submission schema
export const submitFormSchema = z.record(z.string(), z.any());

// External API schemas
export const createExternalApiSchema = z.object({
  formId: z.number().int(),
  url: z.string().url().max(500),
  method: z.nativeEnum(HttpMethod).default(HttpMethod.POST),
  headers: z.record(z.string()).optional(),
  fieldMappings: z.array(z.object({
    fieldId: z.number().int(),
    externalFieldName: z.string().min(1).max(255),
  })).min(1, 'At least one field mapping is required'),
});

export const updateExternalApiSchema = z.object({
  url: z.string().url().max(500).optional(),
  method: z.nativeEnum(HttpMethod).optional(),
  headers: z.record(z.string()).optional(),
  enabled: z.boolean().optional(),
  fieldMappings: z.array(z.object({
    fieldId: z.number().int(),
    externalFieldName: z.string().min(1).max(255),
  })).optional(),
});

// Payment schemas
export const visaPaymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z.string().regex(/^\d{2}$/, 'Invalid year'),
  amount: z.number().positive(),
});

export const mobileMoneyPaymentSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  amount: z.number().positive(),
});

// Organization schemas
export const setupOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(255),
  description: z.string().optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  contactEmail: z.string().email('Invalid email address').max(255).optional().nullable().or(z.literal('')),
  contactPhone: z.string().max(50).optional().nullable(),
  supportEmail: z.string().email('Invalid email address').max(255).optional().nullable().or(z.literal('')),
  website: z.string().url('Invalid URL').max(500).optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  adminName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  adminEmail: z.string().email('Invalid email address').max(255),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  contactEmail: z.string().email().max(255).optional().nullable(),
  contactPhone: z.string().max(50).optional().nullable(),
  supportEmail: z.string().email().max(255).optional().nullable(),
  website: z.string().url().max(500).optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
});

// User management schemas
export const createUserSchema = z.object({
  names: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  title: z.string().max(255).optional().nullable(),
});

export const updateUserSchema = z.object({
  names: z.string().min(2).max(255).optional(),
  title: z.string().max(255).optional().nullable(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  address: z.string().optional().nullable(),
  twitter: z.string().url().optional().nullable().or(z.literal('')),
  facebook: z.string().url().optional().nullable().or(z.literal('')),
  linkedin: z.string().url().optional().nullable().or(z.literal('')),
  about: z.string().optional().nullable(),
});

// Form access schemas
export const assignFormAccessSchema = z.object({
  userId: z.number().int(),
  formId: z.number().int().optional().nullable(), // NULL means all forms
  access: z.nativeEnum(AccessLevel).default(AccessLevel.VIEW),
});

export const updateFormAccessSchema = z.object({
  access: z.nativeEnum(AccessLevel),
});

// ============================================================================
// TypeScript Types
// ============================================================================

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type CreateFormFieldInput = z.infer<typeof createFormFieldSchema>;
export type SubmitFormInput = z.infer<typeof submitFormSchema>;
export type CreateExternalApiInput = z.infer<typeof createExternalApiSchema>;
export type UpdateExternalApiInput = z.infer<typeof updateExternalApiSchema>;
export type VisaPaymentInput = z.infer<typeof visaPaymentSchema>;
export type MobileMoneyPaymentInput = z.infer<typeof mobileMoneyPaymentSchema>;
export type SetupOrganizationInput = z.infer<typeof setupOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AssignFormAccessInput = z.infer<typeof assignFormAccessSchema>;
export type UpdateFormAccessInput = z.infer<typeof updateFormAccessSchema>;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Form-related Types
// ============================================================================

export interface FormWithDetails {
  id: number;
  title: string;
  type: FormType;
  identifier: string;
  identifierhash: string;
  status: Status;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  fields: FormFieldWithAnswers[];
  _count?: {
    replies: number;
  };
}

export interface FormFieldWithAnswers {
  id: number;
  formId: number;
  field: string;
  answerType: AnswerType;
  answerSubtype: string | null;
  status: Status;
  required: boolean;
  placeholder: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  expectedAnswers: ExpectedAnswer[];
}

export interface ExpectedAnswer {
  id: number;
  answer: string;
  fieldId: number;
  status: Status;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSubmission {
  id: number;
  formId: number;
  date: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
  replies: FormReplyData[];
}

export interface FormReplyData {
  id: number;
  replierId: number;
  fieldId: number;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
  field: {
    id: number;
    field: string;
    answerType: AnswerType;
  };
}

export interface FormStatistics {
  totalForms: number;
  activeForms: number;
  totalSurveys: number;
  totalSubmissions: number;
}

// ============================================================================
// Organization Types
// ============================================================================

export interface Organization {
  id: number;
  name: string;
  description: string | null;
  tagline: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  supportEmail: string | null;
  website: string | null;
  address: string | null;
  setupCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// User Types
// ============================================================================

export interface UserProfile {
  id: number;
  organizationId: number | null;
  names: string;
  title: string | null;
  email: string;
  role: UserRole;
  address: string | null;
  twitter: string | null;
  facebook: string | null;
  linkedin: string | null;
  about: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface UserWithAccess extends UserProfile {
  formAccess: FormAccessInfo[];
}

// ============================================================================
// Form Access Types
// ============================================================================

export interface FormAccessInfo {
  id: number;
  userId: number;
  formId: number | null; // NULL means all forms
  access: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  form?: {
    id: number;
    title: string;
    type: FormType;
  };
  user?: {
    id: number;
    names: string;
    email: string;
    role: UserRole;
  };
}

// ============================================================================
// External API Types
// ============================================================================

export interface ExternalApiConfig {
  id: number;
  formId: number;
  url: string;
  method: HttpMethod;
  headers: Record<string, string> | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  fields: ExternalApiFieldMapping[];
}

export interface ExternalApiFieldMapping {
  id: number;
  externalApiId: number;
  fieldId: number;
  externalFieldName: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

export interface EmbedFormConfig {
  formId: string;
  width?: string;
  height?: string;
  border?: boolean;
}

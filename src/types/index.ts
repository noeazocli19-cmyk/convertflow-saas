// ConvertFlow - Core Type Definitions

// ============================================================
// App View State
// ============================================================
export type AppView = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'forgot-password'
  | 'dashboard' 
  | 'convert' 
  | 'tools' 
  | 'history'
  | 'settings'
  | 'admin';

export type ToolCategory = 'pdf' | 'image' | 'video' | 'audio' | 'archive' | 'ebook' | 'developer';

// ============================================================
// Conversion Types
// ============================================================
export interface ConversionFormat {
  input: string;
  output: string;
  label: string;
  category: ToolCategory;
  icon?: string;
}

export interface ConversionJob {
  id: string;
  inputFormat: string;
  outputFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  files: ConversionFileItem[];
  createdAt: Date;
  completedAt?: Date;
  fileSize: number;
  outputSize?: number;
}

export interface ConversionFileItem {
  id: string;
  file: File;
  originalName: string;
  fileName: string;
  fileSize: number;
  outputUrl?: string;
  outputSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  preview?: string;
}

// ============================================================
// Tool Types
// ============================================================
export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  inputFormats: string[];
  outputFormat: string;
  popular?: boolean;
}

export interface PDFTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: string;
}

export interface ImageTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: string;
}

export interface VideoTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: string;
}

// ============================================================
// User & Auth Types
// ============================================================
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'enterprise';
  storageUsed: number;
  storageLimit: number;
  emailVerified: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// ============================================================
// Dashboard Types
// ============================================================
export interface DashboardStats {
  totalConversions: number;
  conversionsToday: number;
  totalFileSize: number;
  storageUsed: number;
  storageLimit: number;
  favoriteFormat: string;
  successRate: number;
}

export interface ConversionHistoryItem {
  id: string;
  inputFormat: string;
  outputFormat: string;
  status: string;
  fileSize: number;
  outputSize: number;
  createdAt: string;
  toolType: string;
}

export interface ActivityData {
  date: string;
  conversions: number;
}

// ============================================================
// UI State Types
// ============================================================
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  action: () => void;
}

// API related types and interfaces
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// OpenAI related types
export interface OpenAIRequest {
  prompt: string;
  context?: string;
}

export interface OpenAIResponse {
  content: string;
  tokens?: number;
}

// Actions API types
export interface ActionsRequest {
  action: string;
  data?: any;
}

export interface ActionsResponse {
  result: any;
  message?: string;
}
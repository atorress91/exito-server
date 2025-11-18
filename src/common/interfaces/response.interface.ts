export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code: number;
  errors?: any;
  meta?: Record<string, any>;
}

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> = {
  data: T;
  meta?: {
    nextCursor?: string | null;
    total?: number;
  };
};

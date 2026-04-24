export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponseMeta = {
  nextCursor?: string | null;
  total?: number;
};

export type ApiResponse<T> = {
  data: T;
  meta?: ApiResponseMeta;
};

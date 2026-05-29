export class ApiClientError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code = "UNKNOWN_ERROR",
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
  }
}

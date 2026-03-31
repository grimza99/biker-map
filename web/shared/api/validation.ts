import { z } from "zod";

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown) {
  return schema.parse(body);
}

export async function parseRequestBody<T extends z.ZodTypeAny>(request: Request, schema: T) {
  const body = await request.json();
  return parseBody(schema, body);
}

import { z } from "zod";
import type { LoginBody, SignUpBody } from "../types/auth";
import { SCHEMA_ATOM } from "./schema-atom";

export const loginSchema = z.object({
  email: SCHEMA_ATOM.email,
  password: SCHEMA_ATOM.password,
}) satisfies z.ZodType<LoginBody>;

export const signUpSchema = z.object({
  email: SCHEMA_ATOM.email,
  password: SCHEMA_ATOM.password,
  name: SCHEMA_ATOM.name,
}) satisfies z.ZodType<SignUpBody>;

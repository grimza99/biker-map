"use client";

import { phoneSchema, verifyCodeSchema } from "@package-shared/index";

export const sendVerificationCodeFormSchema = phoneSchema;

export const verifyCodeFormSchema = verifyCodeSchema;

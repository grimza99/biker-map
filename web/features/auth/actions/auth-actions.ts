"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { createSupabaseAuthClient } from "@shared/lib/supabase";
import { loginFormSchema, signUpFormSchema } from "../model/auth-schemas";

export type AuthActionState = {
  serverError: string | null;
};

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      serverError:
        "로그인 요청을 처리하지 못했습니다. 입력값을 확인한 뒤 다시 시도해 주세요.",
    };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        serverError: "이메일 또는 비밀번호를 확인해 주세요.",
      };
    }

    throw error;
  }

  redirect("/map?toast=login-success");
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      serverError:
        "회원가입 요청을 처리하지 못했습니다. 입력값을 확인한 뒤 다시 시도해 주세요.",
    };
  }

  const supabase = createSupabaseAuthClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
      },
    },
  });

  if (error) {
    return {
      serverError: error.message,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        serverError: "회원가입은 완료됐지만 자동 로그인에 실패했습니다.",
      };
    }

    throw error;
  }

  redirect("/map?toast=signup-success");
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/auth?toast=logout-success",
  });
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/auth?toast=logout-success",
  });
}

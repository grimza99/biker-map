import { type PropsWithChildren } from "react";
import { View } from "react-native";

import { cn } from "@/shared";
import { AppText } from "./AppText";

export type FieldSize = "sm" | "md" | "lg";

export type FieldBaseProps = {
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  label?: string;
  labelStyle?: string;
  messageStyle?: string;
  size?: FieldSize;
  className?: string;
};

export type FieldMessage = {
  text: string;
  tone: "danger" | "muted";
};

export function FieldShell({
  children,
  disabled = false,
  errorText,
  helperText,
  label,
  labelStyle,
  messageStyle,
  className,
}: PropsWithChildren<FieldBaseProps>) {
  const message = resolveFieldMessage(errorText, helperText);

  return (
    <View className={cn("gap-2", disabled && "opacity-50", className)}>
      {label && (
        <AppText
          tone={errorText ? "danger" : "default"}
          className={cn("font-extrabold text-sm", labelStyle)}
        >
          {label}
        </AppText>
      )}

      {children}

      {message && (
        <AppText
          tone={message.tone === "danger" ? "danger" : "muted"}
          className={cn("text-xs font-semibold", messageStyle)}
        >
          {message.text}
        </AppText>
      )}
    </View>
  );
}

export function resolveFieldMessage(
  errorText?: string,
  helperText?: string
): FieldMessage | null {
  if (errorText) {
    return {
      text: errorText,
      tone: "danger",
    };
  }

  if (helperText) {
    return {
      text: helperText,
      tone: "muted",
    };
  }

  return null;
}
export const fieldSizeStyleMap: Record<FieldSize, string> = {
  sm: "min-h-11 rounded-xl py-2.5 px-3.5",
  md: "min-h-12 rounded-xl px-4 py-3",
  lg: "min-h-[54px] rounded-xl py-3.5 px-4.5",
};

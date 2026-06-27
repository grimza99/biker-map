import { ComponentProps } from "react";
import { Text } from "react-native";
import { cn } from "../lib";

type AppTextTone = "default" | "muted" | "subtle" | "danger";

type AppTextProps = ComponentProps<typeof Text> & {
  className?: string;
  tone?: AppTextTone;
};

const toneClassName: Record<AppTextTone, string> = {
  default: "text-text",
  muted: "text-muted",
  subtle: "text-text/88",
  danger: "text-danger",
};

export function AppText({
  className,
  tone = "default",
  ...props
}: AppTextProps) {
  return (
    <Text
      className={cn("whitespace-nowrap", toneClassName[tone], className)}
      {...props}
    />
  );
}

import { ComponentProps } from "react";
import { Text } from "react-native";

import { cn } from "@/shared";

type AppTextTone = "default" | "muted" | "subtle";

type AppTextProps = ComponentProps<typeof Text> & {
  className?: string;
  tone?: AppTextTone;
};

const toneClassName: Record<AppTextTone, string> = {
  default: "text-text",
  muted: "text-text/76",
  subtle: "text-text/88",
};

export function AppText({
  className,
  tone = "default",
  ...props
}: AppTextProps) {
  return <Text className={cn(toneClassName[tone], className)} {...props} />;
}

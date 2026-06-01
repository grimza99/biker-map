import { ReactNode } from "react";
import { View } from "react-native";

import { cn } from "@/shared";

interface IDefaultCardProps {
  containerStyle?: string;
  footerStyle?: string;

  children: ReactNode;
  footer?: ReactNode;
}
export function DefaultCardContainer({
  containerStyle,
  footerStyle,
  children,
  footer,
}: IDefaultCardProps) {
  return (
    <View
      className={cn(
        "p-4 flex flex-col gap-4 rounded-2xl border border-border bg-bg",
        containerStyle
      )}
    >
      {children}
      {footer && (
        <View
          className={cn(
            "flex flex-col items-center justify-center",
            footerStyle
          )}
        >
          {footer}
        </View>
      )}
    </View>
  );
}

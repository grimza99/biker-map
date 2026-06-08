import { type PropsWithChildren } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/shared";
import { AppText } from "../common";

type AppScreenProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}>;

export function AppScreen({
  eyebrow,
  title,
  description,
  children,
  className,
}: AppScreenProps) {
  return (
    <SafeAreaView className={cn("flex-1 bg-bg", className)} edges={["top"]}>
      <ScrollView
        contentContainerClassName="gap-[18px] p-5 pb-7"
        showsVerticalScrollIndicator={false}
      >
        <AppText className="text-xs uppercase tracking-[1.2px] text-active">
          {eyebrow}
        </AppText>
        <AppText className="text-[34px] font-extrabold leading-10">
          {title}
        </AppText>
        <AppText className="text-[15px] leading-5.5" tone="muted">
          {description}
        </AppText>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

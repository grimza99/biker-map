import { View } from "react-native";
import { cn } from "../lib";
import { ReactNode } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { bikerMapTheme } from "@package-shared/constants";
import { AppText, Button } from "@/components/common";
import { useRouter } from "expo-router";
import { AppScreen } from "@/components/shell";

type TStatevariant = "error" | "not-found";

interface IScreenStateProps {
  title: string;
  description?: string;
  variant: TStatevariant;
  icon?: ReactNode;
  refetch?: () => void;
  className?: string;
}
export function ScreenState({
  title,
  description,
  variant,
  icon,
  refetch,
  className,
}: IScreenStateProps) {
  const resolvedIcon = icon ? icon : stateVariantIconMap[variant];
  const router = useRouter();
  return (
    <AppScreen
      containerStyle={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View className="flex justify-center items-center min-h-200 w-full flex-col gap-20">
        <View className="flex flex-col gap-5 justify-center items-center">
          {resolvedIcon}
          <AppText className="text-3xl">{title}</AppText>
          {description && (
            <AppText tone="muted" className="text-lg">
              {description}
            </AppText>
          )}
        </View>
        {refetch && (
          <Button onPress={() => refetch()}>
            <Ionicons
              name="reload"
              size={24}
              color={bikerMapTheme.colors.accent}
            />
          </Button>
        )}
        <Button onPress={() => router.back()}>
          <AppText>돌아가기</AppText>
        </Button>
      </View>
    </AppScreen>
  );
}

const stateVariantIconMap: Record<TStatevariant, ReactNode> = {
  error: (
    <Ionicons name="warning" size={48} color={bikerMapTheme.colors.danger} />
  ),
  "not-found": (
    <Feather name="info" size={48} color={bikerMapTheme.colors.border} />
  ),
};

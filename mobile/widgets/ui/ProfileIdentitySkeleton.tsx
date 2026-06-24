import { cn, SkeletonBlock } from "@/shared";
import { View } from "react-native";

export function ProfileIdentitySkeleton({
  ImageClassName,
  className,
}: {
  ImageClassName?: string;
  className?: string;
}) {
  return (
    <View className={cn("gap-2 flex-row items-center", className)}>
      <SkeletonBlock className={cn("h-8 w-8 rounded-full", ImageClassName)} />
      <SkeletonBlock className="h-5 w-1/5" />
    </View>
  );
}

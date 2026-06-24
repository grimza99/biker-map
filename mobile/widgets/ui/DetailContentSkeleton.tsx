import { SkeletonBlock } from "@/shared";
import { View } from "react-native";

export function DetailContentSkeleton() {
  return (
    <View className="gap-20 py-20">
      <View className="gap-10">
        <SkeletonBlock className="h-10 w-4/5" />
        <SkeletonBlock className="h-5 w-2/5" />
      </View>
      <View className="gap-3">
        <SkeletonBlock className="h-8 w-full" />
        <SkeletonBlock className="h-8 w-11/12" />
      </View>
    </View>
  );
}

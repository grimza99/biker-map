import { DefaultCardContainer } from "@/components/common";
import { SkeletonBlock } from "@/shared";
import { View } from "react-native";

export function ListSkeleton() {
  return (
    <View className="gap-20">
      <SkeletonBlock className="h-30 w-full" />
      <View className="gap-4">
        <ListItemSkeleton />
        <ListItemSkeleton />
        <ListItemSkeleton />
      </View>
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <DefaultCardContainer>
      <SkeletonBlock className="h-8 w-4/5" />
      <SkeletonBlock className="h-5 w-2/5" />
      <View className="flex flex-row justify-between">
        <SkeletonBlock className="h-3 w-1/6" />
        <SkeletonBlock className="h-3 w-1/6" />
      </View>
    </DefaultCardContainer>
  );
}

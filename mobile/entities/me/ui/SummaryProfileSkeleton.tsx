import { DefaultCardContainer } from "@/components/common";
import { SkeletonBlock } from "@/shared";
import { ProfileIdentitySkeleton } from "@/widgets/ui";
import { View } from "react-native";

export function SummaryProfileSkeleton() {
  return (
    <View className="gap-5">
      <DefaultCardContainer>
        <ProfileIdentitySkeleton
          ImageClassName="w-22 h-22"
          className="items-start"
        />
      </DefaultCardContainer>
      <SkeletonBlock className="h-18 w-full" />
    </View>
  );
}

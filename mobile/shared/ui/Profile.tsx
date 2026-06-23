import { Image, View } from "react-native";

import { proficiencyClassNameMap, proficiencyMap } from "@package-shared/model";

import { AppText, Chip } from "@/components/common";
import { useSession } from "@/features/session/model";

export function Profile() {
  const { user } = useSession();

  if (!user) return null;

  const { avatarUrl, name, isVerified, bikeBrand, bikeModel, proficiency } =
    user;
  const proficiencyLabel = proficiency
    ? proficiencyMap[proficiency]
    : "정보 없음";
  const verificationLabel = isVerified ? "본인인증 완료" : "인증 미완료";

  return (
    <View className="bg-panel-soft rounded-[18px] border-2 border-border flex-row py-2 gap-3.5 px-2">
      <Image
        source={{ uri: avatarUrl || undefined }}
        style={{ width: 80 }}
        className="rounded-full border-3 border-accent aspect-square"
      />
      <View className="gap-1">
        <AppText className="text-3xl font-bold">{name}</AppText>
        {bikeBrand && bikeModel ? (
          <View className="flex flex-row gap-2">
            <AppText tone="muted">{bikeBrand}</AppText>
            <AppText>·</AppText>
            <AppText tone="muted">{bikeModel}</AppText>
          </View>
        ) : (
          <AppText tone="muted" className="text-sm">
            바이크 정보 없음
          </AppText>
        )}
        <View className="flex flex-row gap-1.5">
          <Chip
            label={verificationLabel}
            className="bg-green-700/50 text-green-200 border-green-700"
          />

          <Chip
            label={proficiencyLabel}
            className={proficiencyClassNameMap(proficiency)}
          />
        </View>
      </View>
    </View>
  );
}

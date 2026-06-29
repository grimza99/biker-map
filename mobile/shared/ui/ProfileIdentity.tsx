import { Image, View } from "react-native";

import { AppText } from "@/components/common";
import { Feather } from "@expo/vector-icons";
import { bikerMapTheme } from "@package-shared/constants";

interface IProfileIdentityProps {
  avatarUrl: string | null;
  name: string;
}
export function ProfileIdentity({ avatarUrl, name }: IProfileIdentityProps) {
  return (
    <View className="bg-transparent flex flex-row gap-3.5 items-center">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl || undefined }}
          style={{ width: 28 }}
          className="rounded-full border-2 border-border aspect-square"
        />
      ) : (
        <Feather
          name="user"
          size={20}
          color={bikerMapTheme.colors.muted}
          className="w-7 aspect-square text-center rounded-full border-2 border-border"
        />
      )}
      <AppText className="font-bold">{name}</AppText>
    </View>
  );
}

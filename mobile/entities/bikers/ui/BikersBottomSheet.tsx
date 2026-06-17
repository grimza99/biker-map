import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { cn } from "@/shared";
import {
  AppText,
  BottomSheet,
  BottomSheetContent,
  BottomSheetTrigger,
} from "@/components/common";
import { IBiker } from "@package-shared/types";
import { BikerCard } from "./BikerCard";

interface IBikersBottomSheetProps {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  bikers: IBiker[];
}

export function BikersBottomSheet({
  defaultOpen,
  onOpenChange,
  open,
  bikers,
}: IBikersBottomSheetProps) {
  return (
    <BottomSheet
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
    >
      <View
        className="absolute bottom-2 right-0 items-center gap-2.5 w-full flex justify-center"
        pointerEvents="box-none"
      >
        <BottomSheetTrigger
          accessibilityLabel="지도 플로팅 메뉴 열기"
          className="h-8 w-80 items-center rounded-2xl justify-center  bg-panel"
          style={primaryButtonShadow}
        >
          <Ionicons name="reorder-three" size={24} color="white" />
        </BottomSheetTrigger>
      </View>

      <BottomSheetContent
        bodyClassName="gap-[18px]"
        contentContainerClassName={cn("min-h-200")}
        title="주변 바이커들"
        icon={<FontAwesome5 name="motorcycle" size={24} color="white" />}
      >
        <View className="gap-2.5">
          {bikers.length > 0 ? (
            <>
              {bikers.map((biker, idx) => (
                <BikerCard biker={biker} key={`${biker.nickname} - ${idx}`} />
              ))}
            </>
          ) : (
            <AppText>주변에 위치한 바이커가 없습니다</AppText>
          )}
        </View>
      </BottomSheetContent>
    </BottomSheet>
  );
}

const primaryButtonShadow = {
  shadowColor: bikerMapTheme.colors.accent,
  shadowOpacity: 0.28,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};

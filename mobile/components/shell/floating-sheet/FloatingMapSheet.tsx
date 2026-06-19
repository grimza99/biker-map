import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTrigger,
} from "../../common";
import { ReactNode } from "react";

type FloatingMapSheetProps = {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  sheetContent: ReactNode;
  sheetTitle?: string;
  sheetIcon?: ReactNode;
};

export function FloatingMapSheet({
  defaultOpen,
  onOpenChange,
  open,
  sheetContent,
  sheetTitle,
  sheetIcon,
}: FloatingMapSheetProps) {
  return (
    <BottomSheet
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
    >
      <View
        className="absolute bottom-10 right-6 items-center gap-2.5"
        pointerEvents="box-none"
      >
        <BottomSheetTrigger
          accessibilityLabel="지도 플로팅 메뉴 열기"
          className="h-13 w-13 items-center justify-center rounded-full border border-bg bg-bg"
          style={primaryButtonShadow}
        >
          <Ionicons
            name="reorder-three"
            size={24}
            color={bikerMapTheme.colors.accent}
          />
        </BottomSheetTrigger>
      </View>

      <BottomSheetContent
        bodyClassName="gap-[18px]"
        contentContainerClassName="min-h-200"
        title={sheetTitle}
        icon={sheetIcon}
      >
        <View className="gap-2.5">{sheetContent}</View>
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

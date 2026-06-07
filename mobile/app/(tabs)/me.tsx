import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import { Text, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants";
import { GlobalFloatingMenu } from "@/components/common";
import {
  AppScreen,
  AuthRequiredPanel,
  SessionPanel,
} from "../../components/shell";
import { useSession } from "../../features/session/model";

type FloatingMenuOptionId = "favorite" | "my-post" | "my-info" | "draw";

const meFloatingMenuOptions: Array<{
  description: string;
  icon: ReactNode;
  id: FloatingMenuOptionId;
  label: string;
}> = [
  {
    description: "저장한 장소와 경로를 확인합니다.",
    icon: (
      <Ionicons name="heart" size={24} color={bikerMapTheme.colors.accent} />
    ),
    id: "favorite",
    label: "즐겨찾기",
  },
  {
    description: "커뮤니티에 작성한 글을 봅니다.",
    icon: (
      <FontAwesome5
        name="comment-dots"
        size={24}
        color={bikerMapTheme.colors.accent}
      />
    ),
    id: "my-post",
    label: "내가 쓴글",
  },
  {
    description: "프로필과 세션 정보를 확인합니다.",
    icon: (
      <FontAwesome5 name="user" size={24} color={bikerMapTheme.colors.accent} />
    ),
    id: "my-info",
    label: "내 정보",
  },
  {
    description: "계정 삭제 절차로 이동합니다.",
    icon: (
      <Feather
        name="user-minus"
        size={24}
        color={bikerMapTheme.colors.accent}
      />
    ),
    id: "draw",
    label: "회원 탈퇴",
  },
];

const activeMenuContent: Record<
  FloatingMenuOptionId,
  { description: string; title: string }
> = {
  favorite: {
    title: "즐겨찾기",
    description: "저장한 장소와 경로 목록은 후속 API 연결에서 표시합니다.",
  },
  "my-post": {
    title: "내가 쓴글",
    description: "작성한 커뮤니티 글 목록은 마이페이지 API 연결 후 표시합니다.",
  },
  "my-info": {
    title: "내 정보",
    description: "현재 로그인 세션과 프로필 정보를 기준으로 확장합니다.",
  },
  draw: {
    title: "회원 탈퇴",
    description: "계정 삭제는 별도 확인 플로우가 붙은 뒤 진행할 수 있습니다.",
  },
};

export default function MeScreen() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [activeMenu, setActiveMenu] = useState<FloatingMenuOptionId>("my-info");
  const activeContent = activeMenuContent[activeMenu];

  return (
    <AppScreen
      eyebrow="Profile gate"
      title="내 정보"
      description="세션과 개인 설정이 붙을 기준 화면입니다. 비로그인 상태에서는 접근 안내만 보여줍니다."
    >
      {isAuthenticated ? (
        <>
          <SessionPanel />

          <View className="gap-2 rounded-[24px] border border-border bg-panel-solid p-5">
            <Text className="text-[28px] font-extrabold leading-9 text-text">
              {activeContent.title}
            </Text>
            <Text className="text-[15px] leading-[22px] text-muted">
              {activeContent.description}
            </Text>
          </View>

          <GlobalFloatingMenu<FloatingMenuOptionId>
            options={meFloatingMenuOptions}
            onSelect={(option) => {
              setActiveMenu(option.id as FloatingMenuOptionId);
            }}
          />
        </>
      ) : (
        <AuthRequiredPanel description="프로필, 개인 설정, 내가 남긴 활동 정보는 로그인 후 확인할 수 있습니다." />
      )}
    </AppScreen>
  );
}

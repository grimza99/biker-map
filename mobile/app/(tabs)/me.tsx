import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import { Text, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants";
import {
  AppText,
  Button,
  CommonModal,
  GlobalFloatingMenu,
} from "@/components/common";
import { AppScreen } from "../../components/shell";
import { useSession } from "../../features/session/model";

type FloatingMenuOptionId = "favorite" | "my-post" | "my-info" | "draw";
type MeScreenContentId = "favorite" | "my-post" | "my-info";

const meFloatingMenuOptions: Array<{
  icon: ReactNode;
  id: FloatingMenuOptionId;
  label: string;
}> = [
  {
    icon: (
      <Ionicons name="heart" size={24} color={bikerMapTheme.colors.accent} />
    ),
    id: "favorite",
    label: "즐겨찾기",
  },
  {
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
    icon: (
      <FontAwesome5 name="user" size={24} color={bikerMapTheme.colors.accent} />
    ),
    id: "my-info",
    label: "내 정보",
  },
  {
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
  MeScreenContentId,
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
};

export default function MeScreen() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isDrawMenuClicked, setIsDrawMenuClicked] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MeScreenContentId>("my-info");
  const activeContent = activeMenuContent[activeMenu];

  return (
    <AppScreen title="마이페이지">
      {/* todo : authenticated 에 따라서 tab 자체를 보호 */}
      {isAuthenticated ? (
        <>
          <View className="gap-2 rounded-3xl border border-border bg-panel-solid p-5">
            <Text className="text-[28px] font-extrabold leading-9 text-text">
              {activeContent.title}
            </Text>
            <Text className="text-[15px] leading-5.5 text-muted">
              {activeContent.description}
            </Text>
          </View>

          <GlobalFloatingMenu<FloatingMenuOptionId>
            options={meFloatingMenuOptions}
            onSelect={(option) => {
              if (option.id !== "draw") {
                setActiveMenu(option.id as MeScreenContentId);
              } else {
                setIsDrawMenuClicked(true);
              }
            }}
          />
        </>
      ) : null}
      <CommonModal
        icon={
          <View className="border-danger border rounded-2xl py-3.5 px-3.5 bg-danger/25">
            <Ionicons
              name="warning"
              size={24}
              color={bikerMapTheme.colors.accent}
            />
          </View>
        }
        visibleCloseButton={false}
        visible={isDrawMenuClicked}
        title="회원 탈퇴를 진행할까요?"
        description="탈퇴 시 저장된 추천 경로, 작성하신 게시글의 소유 권한이 삭제되며 복구할 수 없습니다. 정말로 탈퇴 절차를 진행할까요?"
        onClose={() => setIsDrawMenuClicked(false)}
        footer={
          <View className="flex flex-row gap-2 items-center">
            <Button
              variant="secondary"
              onPress={() => setIsDrawMenuClicked(false)}
            >
              <AppText>취소</AppText>
            </Button>
            {/* todo : 탈퇴 핸들러  */}
            <Button
              onPress={() => {
                console.log("탈퇴");
              }}
            >
              <AppText className="text-white">탈퇴하기</AppText>
            </Button>
          </View>
        }
      />
    </AppScreen>
  );
}

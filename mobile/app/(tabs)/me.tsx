import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import { View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants";
import {
  AppText,
  Button,
  CommonModal,
  GlobalFloatingMenu,
} from "@/components/common";
import { AppScreen } from "../../components/shell";
import { useSession } from "../../features/session/model";
import { Redirect } from "expo-router";
import { MyFavoriteSection, SummaryProfile } from "@/entities/me";
import { MyPostSection } from "@/entities/me/ui/MyPostSection";

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

type IActiveMenuContent = Record<
  MeScreenContentId,
  {
    title: string;
    rightHandle?: ReactNode;
    content: ReactNode;
  }
>;
export default function MeScreen() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isDrawMenuClicked, setIsDrawMenuClicked] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MeScreenContentId>("my-info");

  const activeMenuContent: IActiveMenuContent = {
    "my-info": {
      title: "상세 계정 정보",
      content: <></>,
    },
    favorite: {
      title: "즐겨찾기",
      content: <MyFavoriteSection />,
    },
    "my-post": {
      title: "내가 쓴 커뮤니티 게시글",
      content: <MyPostSection />,
    },
  };
  const activeContent = activeMenuContent[activeMenu];

  return (
    <AppScreen title="마이페이지">
      {/* todo : authenticated 에 따라서 tab 자체를 보호 */}
      {isAuthenticated ? (
        <>
          <SummaryProfile />
          <View className="w-full flex flex-row justify-between">
            <AppText className="font-bold" tone="muted">
              {activeContent.title}
            </AppText>
            {activeContent.rightHandle && activeContent.rightHandle}
          </View>
          {activeContent.content}

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
      ) : (
        <>
          <Redirect href="/auth" />
        </>
      )}
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

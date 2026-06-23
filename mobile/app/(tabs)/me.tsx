import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";

import { bikerMapTheme } from "@package-shared/index";
import { AppText, GlobalFloatingMenu } from "@/components/common";
import { AppScreen } from "../../components/shell";
import { useSession } from "../../features/session/model";
import {
  MyFavoriteSection,
  ProfileSection,
  MyPostSection,
  SummaryProfile,
} from "@/entities/me";
import { DeleteAccountModal } from "@/features/me";

type FloatingMenuOptionId =
  | "favorite"
  | "my-post"
  | "my-info"
  | "delete-account";
type MeScreenContentId = "favorite" | "my-post" | "my-info";

const meFloatingMenuOptions: {
  icon: ReactNode;
  id: FloatingMenuOptionId;
  label: string;
  tone?: "default" | "danger";
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
    icon: <Feather name="user-minus" size={24} color="white" />,
    id: "delete-account",
    label: "회원 탈퇴",
    tone: "danger",
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
  const [isDeleteAccountClicked, setIsDeleteAccountClicked] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MeScreenContentId>("my-info");
  const [isProfileEdit, setIsProfileEdit] = useState(false);

  const activeMenuContent: IActiveMenuContent = {
    "my-info": {
      title: "상세 계정 정보",
      rightHandle: (
        <>
          {isProfileEdit ? (
            <Ionicons
              name="reload-circle-outline"
              size={24}
              color={bikerMapTheme.colors.accent}
              onPress={() => setIsProfileEdit(false)}
            />
          ) : (
            <Feather
              name="edit"
              size={24}
              color={bikerMapTheme.colors.accent}
              onPress={() => setIsProfileEdit(true)}
            />
          )}
        </>
      ),
      content: <ProfileSection isEdit={isProfileEdit} />,
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
    <AppScreen
      title="마이페이지"
      overlay={
        <GlobalFloatingMenu<FloatingMenuOptionId>
          options={meFloatingMenuOptions}
          onSelect={(option) => {
            if (option.id === "delete-account") {
              setIsDeleteAccountClicked(true);
              return;
            }

            setActiveMenu(option.id as MeScreenContentId);
          }}
        />
      }
    >
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
        </>
      ) : (
        <>
          <Redirect href="/auth" />
        </>
      )}
      <DeleteAccountModal
        isOpen={isDeleteAccountClicked}
        onClose={() => setIsDeleteAccountClicked(false)}
      />
    </AppScreen>
  );
}

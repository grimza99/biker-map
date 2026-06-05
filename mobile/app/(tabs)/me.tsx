import { bikerMapTheme } from "@package-shared/constants";
import { AppScreen, GlobalFloatingMenu } from "../../components/shell";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";

type FloatingMenuOptionId = "favorite" | "my-post" | "my-info" | "draw";

const meFloatingMenuOptions: {
  icon: ReactNode;
  id: FloatingMenuOptionId;
  label: string;
}[] = [
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

export default function MeScreen() {
  const [activeMenu, setActiveMenu] = useState<FloatingMenuOptionId>("my-info");
  return (
    <AppScreen title="마이페이지">
      <GlobalFloatingMenu
        options={meFloatingMenuOptions}
        onSelect={(option) => {
          setActiveMenu(option.id as FloatingMenuOptionId);
        }}
      />
    </AppScreen>
  );
}

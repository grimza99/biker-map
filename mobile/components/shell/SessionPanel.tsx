import { Pressable, Text, View } from "react-native";

import { useSession } from "../../features/session/model";

//todo 삭제 예정
export function SessionPanel() {
  const { status, user, signOut } = useSession();

  const isAuthenticated = status === "authenticated";

  return (
    <View className="gap-3 rounded-[20px] border border-border bg-panel-solid p-4.5">
      <Text className="text-lg font-bold text-text">
        {isAuthenticated ? "authenticated" : "anonymous"}
      </Text>
      <Text className="text-sm leading-5.25 text-muted">
        {isAuthenticated
          ? `${
              user?.name ?? "사용자"
            }가 로그인된 상태입니다. 탭 화면은 이 상태를 기준으로 확장됩니다.`
          : "로그인 전 상태입니다. 현재는 gate 구조만 열려 있습니다."}
      </Text>

      {isAuthenticated ? (
        <Pressable
          className="self-start rounded-full bg-text px-4 py-3"
          onPress={() => void signOut()}
        >
          <Text className="text-sm font-bold text-bg">로그아웃</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

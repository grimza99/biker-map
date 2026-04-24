import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppScreen, SessionPanel } from "../../components/shell";

function ActionCard({ href, title, description }: { href: "/" | "/map" | "/community" | "/me"; title: string; description: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  return (
    <AppScreen
      eyebrow="Expo Router shell"
      title="Biker Map"
      description="앱의 첫 수직 슬라이스를 여는 최소 셸입니다. 라우팅, 탭 구조, placeholder 화면만 먼저 연결했습니다."
    >
      <SessionPanel />
      <View style={styles.grid}>
        <ActionCard href="/map" title="지도" description="장소와 경로 화면의 진입점" />
        <ActionCard href="/community" title="커뮤니티" description="게시글 목록과 상세로 확장될 자리" />
        <ActionCard href="/me" title="내 정보" description="세션과 개인 설정의 기준 화면" />
        <ActionCard href="/" title="홈" description="현재 앱 셸 상태를 확인하는 시작점" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    minHeight: 124,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#23384f",
    backgroundColor: "#111f33",
    padding: 16,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#f8fcff",
    fontSize: 18,
    fontWeight: "700",
  },
  cardDescription: {
    color: "#a9bdd1",
    fontSize: 13,
    lineHeight: 18,
  },
});

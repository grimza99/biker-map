import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";
import {
  NotificationSheet,
  type NotificationItem,
} from "../../components/shell";
import { useSession } from "../../features/session/model";

const quickFilters = ["주유소", "정비소", "카페", "맛집", "휴게/쉼터"] as const;

const nearbyPlaces = [
  {
    name: "남산 라이더 카페",
    type: "카페",
    distance: "0.8km",
    status: "운영중",
  },
  {
    name: "한강 정비 스팟",
    type: "정비소",
    distance: "1.4km",
    status: "후기 많음",
  },
  { name: "성수 주유소", type: "주유소", distance: "2.1km", status: "가까움" },
  {
    name: "응봉 휴게 쉼터",
    type: "휴게/쉼터",
    distance: "2.7km",
    status: "잠시 쉬기",
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "새 댓글이 달렸어요",
    summary: "지도 저장한 장소에 대화가 이어졌습니다.",
    time: "2분 전",
    unread: true,
  },
  {
    id: "n2",
    title: "즐겨찾기한 카페가 열렸어요",
    summary: "오전 영업 상태로 바뀌었습니다.",
    time: "18분 전",
    unread: true,
  },
  {
    id: "n3",
    title: "후기 반응 +4",
    summary: "한강 정비 스팟에 새로운 반응이 쌓였습니다.",
    time: "1시간 전",
    unread: false,
  },
];

export default function MapScreen() {
  const { status } = useSession();
  const [activeFilter, setActiveFilter] =
    useState<(typeof quickFilters)[number]>("정비소");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotificationSheetVisible, setIsNotificationSheetVisible] =
    useState(false);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const highlightedPlaces = useMemo(() => {
    return nearbyPlaces.filter((place) => {
      if (activeFilter === "휴게/쉼터") {
        return true;
      }

      if (activeFilter === "카페") {
        return place.type === "카페";
      }

      return place.type === activeFilter;
    });
  }, [activeFilter]);

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, unread: false }))
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.mapBackdrop} />
      <View style={styles.mapGlowTop} />
      <View style={styles.mapGlowBottom} />

      <View style={styles.topBar}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Map shell</Text>
          <Text style={styles.title}>지도</Text>
          <Text style={styles.subtitle}>
            지도 {" > "} 검색 {" > "} 빠른 필터 우선순위를 반영한 full-bleed
            shell
          </Text>
        </View>

        {status === "authenticated" ? (
          <Pressable
            style={styles.bellButton}
            onPress={() => setIsNotificationSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="알림 열기"
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={bikerMapTheme.colors.text}
            />
            {unreadCount > 0 ? <View style={styles.bellDot} /> : null}
          </Pressable>
        ) : null}
      </View>

      <View style={styles.overlayPanel}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchLabel}>검색</Text>
            <Text style={styles.searchPlaceholder}>장소, 경로, 카테고리</Text>
          </View>
          <Pressable style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>내 위치</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {quickFilters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <Pressable
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.searchHint}>
          상세 필터는 다음 단계에서 sheet로 확장할 수 있습니다.
        </Text>
      </View>

      <View style={styles.mapCanvas}>
        <View style={[styles.routeLine, styles.routeLineA]} />
        <View style={[styles.routeLine, styles.routeLineB]} />
        <View style={[styles.routeLine, styles.routeLineC]} />
        <View style={[styles.pin, styles.pinPrimary]} />
        <View style={[styles.pin, styles.pinSecondary]} />
        <View style={[styles.pin, styles.pinWarning]} />
        <View style={styles.mapGrid} />
      </View>

      <View style={styles.bottomDock}>
        <View style={styles.dockHeader}>
          <View>
            <Text style={styles.dockLabel}>빠른 탐색</Text>
            <Text style={styles.dockTitle}>{activeFilter} 중심 주변 결과</Text>
          </View>
          <View style={styles.dockBadge}>
            <Text style={styles.dockBadgeText}>PM priority</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.placeList}
          showsVerticalScrollIndicator={false}
        >
          {highlightedPlaces.map((place) => (
            <View key={place.name} style={styles.placeCard}>
              <View style={styles.placeMeta}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeSub}>
                  {place.type} · {place.distance}
                </Text>
              </View>
              <Text style={styles.placeStatus}>{place.status}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <NotificationSheet
        visible={isNotificationSheetVisible}
        notifications={notifications}
        onClose={() => setIsNotificationSheetVisible(false)}
        onMarkAllRead={markAllAsRead}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: bikerMapTheme.colors.bg,
  },
  mapBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: bikerMapTheme.colors.bg,
  },
  mapGlowTop: {
    position: "absolute",
    top: -120,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(69, 93, 115, 0.16)",
  },
  mapGlowBottom: {
    position: "absolute",
    bottom: 120,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(229, 87, 47, 0.10)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: bikerMapTheme.colors.active,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: bikerMapTheme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  subtitle: {
    color: bikerMapTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 320,
  },
  bellButton: {
    position: "relative",
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.accent,
  },
  overlayPanel: {
    gap: 10,
    marginHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: "rgba(23, 26, 30, 0.92)",
    padding: 16,
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  searchBox: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  searchLabel: {
    color: bikerMapTheme.colors.active,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  searchPlaceholder: {
    color: bikerMapTheme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  ctaButton: {
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: bikerMapTheme.colors.text,
    paddingHorizontal: 16,
  },
  ctaButtonText: {
    color: bikerMapTheme.colors.bg,
    fontSize: 14,
    fontWeight: "800",
  },
  filterRow: {
    gap: 10,
    paddingVertical: 2,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: {
    borderColor: bikerMapTheme.colors.accent,
    backgroundColor: bikerMapTheme.colors.accent,
  },
  filterChipText: {
    color: bikerMapTheme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: bikerMapTheme.colors.bg,
  },
  searchHint: {
    color: bikerMapTheme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  mapCanvas: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
    overflow: "hidden",
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  routeLine: {
    position: "absolute",
    backgroundColor: bikerMapTheme.colors.border,
    borderRadius: 999,
  },
  routeLineA: {
    left: -20,
    top: 220,
    width: 320,
    height: 10,
    transform: [{ rotate: "24deg" }],
  },
  routeLineB: {
    left: 20,
    top: 360,
    width: 300,
    height: 10,
    transform: [{ rotate: "-22deg" }],
  },
  routeLineC: {
    left: 80,
    top: 292,
    width: 180,
    height: 10,
    transform: [{ rotate: "90deg" }],
  },
  pin: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: bikerMapTheme.colors.text,
  },
  pinPrimary: {
    left: 88,
    top: 240,
    backgroundColor: bikerMapTheme.colors.accent,
  },
  pinSecondary: {
    left: 192,
    top: 322,
    backgroundColor: bikerMapTheme.colors.active,
  },
  pinWarning: {
    left: 270,
    top: 188,
    backgroundColor: bikerMapTheme.colors.warning,
  },
  bottomDock: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    gap: 12,
    maxHeight: 260,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: "rgba(17, 19, 21, 0.94)",
    padding: 16,
  },
  dockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  dockLabel: {
    color: bikerMapTheme.colors.active,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  dockTitle: {
    color: bikerMapTheme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  dockBadge: {
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.panelSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dockBadgeText: {
    color: bikerMapTheme.colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  placeList: {
    gap: 10,
    paddingBottom: 4,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    padding: 14,
  },
  placeMeta: {
    flex: 1,
    gap: 4,
  },
  placeName: {
    color: bikerMapTheme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  placeSub: {
    color: bikerMapTheme.colors.muted,
    fontSize: 12,
  },
  placeStatus: {
    color: bikerMapTheme.colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
});

import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { AppScreen, SessionPanel } from "../../components/shell";

const quickFilters = ["주유소", "정비소", "카페", "맛집", "휴게/쉼터"] as const;

const nearbyPlaces = [
  { name: "남산 라이더 카페", type: "카페", distance: "0.8km", status: "운영중" },
  { name: "한강 정비 스팟", type: "정비소", distance: "1.4km", status: "후기 많음" },
  { name: "성수 주유소", type: "주유소", distance: "2.1km", status: "가까움" },
];

export default function MapScreen() {
  const [activeFilter, setActiveFilter] = useState<(typeof quickFilters)[number]>("정비소");

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

  return (
    <AppScreen
      eyebrow="Map shell"
      title="지도"
      description="지도 > 검색 > 빠른 필터 우선순위를 반영한 모바일 첫 화면입니다."
    >
      <SessionPanel />

      <View style={styles.searchPanel}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchLabel}>검색</Text>
            <Text style={styles.searchPlaceholder}>장소, 경로, 카테고리</Text>
          </View>
          <Pressable style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>내 위치</Text>
          </Pressable>
        </View>
        <Text style={styles.searchHint}>
          PM 우선순위: 지도 {" > "} 검색 {" > "} 빠른 필터 {" > "} 상세 필터
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {quickFilters.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <Pressable
              key={filter}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{filter}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.mapShell}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapEyebrow}>실제 지도는 다음 라운드에서 연결</Text>
          <Text style={styles.mapTitle}>현재는 위치 탐색 shell만 먼저 고정합니다</Text>
        </View>

        <View style={styles.mapCanvas}>
          <View style={[styles.routeLine, styles.routeLineA]} />
          <View style={[styles.routeLine, styles.routeLineB]} />
          <View style={[styles.routeLine, styles.routeLineC]} />
          <View style={[styles.pin, styles.pinPrimary]} />
          <View style={[styles.pin, styles.pinSecondary]} />
          <View style={[styles.pin, styles.pinWarning]} />
          <View style={styles.mapGlow} />
        </View>
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.infoLabel}>빠른 탐색</Text>
        <Text style={styles.infoTitle}>{activeFilter} 중심 주변 결과</Text>
        <View style={styles.placeList}>
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
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchPanel: {
    gap: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
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
  searchHint: {
    color: bikerMapTheme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  filterRow: {
    gap: 10,
    paddingTop: 2,
    paddingBottom: 2,
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
  mapShell: {
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
    padding: 16,
  },
  mapHeader: {
    gap: 6,
  },
  mapEyebrow: {
    color: bikerMapTheme.colors.active,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  mapTitle: {
    color: bikerMapTheme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  mapCanvas: {
    height: 240,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    overflow: "hidden",
  },
  mapGlow: {
    position: "absolute",
    top: -20,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(229, 87, 47, 0.18)",
  },
  routeLine: {
    position: "absolute",
    backgroundColor: bikerMapTheme.colors.border,
    borderRadius: 999,
  },
  routeLineA: {
    left: -20,
    top: 60,
    width: 320,
    height: 10,
    transform: [{ rotate: "24deg" }],
  },
  routeLineB: {
    left: 20,
    top: 150,
    width: 300,
    height: 10,
    transform: [{ rotate: "-22deg" }],
  },
  routeLineC: {
    left: 80,
    top: 112,
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
    top: 92,
    backgroundColor: bikerMapTheme.colors.accent,
  },
  pinSecondary: {
    left: 172,
    top: 152,
    backgroundColor: bikerMapTheme.colors.active,
  },
  pinWarning: {
    left: 240,
    top: 68,
    backgroundColor: bikerMapTheme.colors.warning,
  },
  infoPanel: {
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    padding: 18,
  },
  infoLabel: {
    color: bikerMapTheme.colors.active,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  infoTitle: {
    color: bikerMapTheme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  placeList: {
    gap: 10,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
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

import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";
import type { PlaceCategory, PlaceListItem } from "@package-shared/types/place";
import { MapCanvasWebView } from "../../features/map/ui/MapCanvasWebView";

const quickFilters = ["주유소", "정비소", "카페", "맛집", "휴게/쉼터"] as const;

const FILTER_TO_CATEGORY: Record<(typeof quickFilters)[number], PlaceCategory> = {
  "주유소": "gas",
  "정비소": "repair",
  "카페": "cafe",
  "맛집": "shop",
  "휴게/쉼터": "rest",
};

const nearbyPlaces: PlaceListItem[] = [
  {
    id: "place-1",
    name: "남산 라이더 카페",
    category: "cafe",
    address: "서울 용산구 남산공원길 105",
    lat: 37.5507,
    lng: 127.0001,
    naverPlaceUrl: "",
  },
  {
    id: "place-2",
    name: "한강 정비 스팟",
    category: "repair",
    address: "서울 서초구 반포동 한강공원",
    lat: 37.5212,
    lng: 126.9985,
    naverPlaceUrl: "",
  },
  {
    id: "place-3",
    name: "성수 주유소",
    category: "gas",
    address: "서울 성동구 성수동1가",
    lat: 37.5444,
    lng: 127.0557,
    naverPlaceUrl: "",
  },
  {
    id: "place-4",
    name: "응봉 휴게 쉼터",
    category: "rest",
    address: "서울 성동구 응봉동",
    lat: 37.5406,
    lng: 127.018,
    naverPlaceUrl: "",
  },
];

export default function MapScreen() {
  const [activeFilter, setActiveFilter] =
    useState<(typeof quickFilters)[number]>("정비소");
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);

  const highlightedPlaces = useMemo(() => {
    const category = FILTER_TO_CATEGORY[activeFilter];
    return nearbyPlaces.filter((place) => place.category === category);
  }, [activeFilter]);

  const handleMarkerPressed = (placeId: string) => {
    setFocusedPlaceId(placeId);
  };

  return (
    <View style={styles.screen}>
      <MapCanvasWebView
        activeFilter={activeFilter}
        focusedPlaceId={focusedPlaceId}
        onMarkerPressed={handleMarkerPressed}
        places={highlightedPlaces}
      />

      <SafeAreaView style={styles.overlayPanel} edges={["top"]}>
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
      </SafeAreaView>

      {/* bottom sheet 예정 */}
      {/* <View style={styles.bottomDock}>
        <ScrollView
          contentContainerStyle={styles.placeList}
          showsVerticalScrollIndicator={false}
        >
          {highlightedPlaces.map((place) => (
            <Pressable
              key={place.id}
              style={[
                styles.placeCard,
                focusedPlaceId === place.id && styles.placeCardFocused,
              ]}
              onPress={() => setFocusedPlaceId(place.id)}
            >
              <View style={styles.placeMeta}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeSub}>
                  {place.type} · {place.distance}
                </Text>
              </View>
              <Text style={styles.placeStatus}>{place.status}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: bikerMapTheme.colors.bg,
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 12,
    paddingTop: 8,
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
  placeCardFocused: {
    borderColor: bikerMapTheme.colors.accent,
    backgroundColor: bikerMapTheme.colors.panelSoft,
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

import { View } from "react-native";

import { PlaceListItem, RouteListItem } from "@package-shared/index";
import { PlaceCard } from "@/entities/place/ui/PlaceCard";
import { RouteCard } from "@/entities/route";

type MapMarkerClickSheetContentProps = {
  item:
    | ({ kind: "place" } & PlaceListItem)
    | ({ kind: "route" } & RouteListItem);
};

export function MapMarkerClickSheetContent({
  item,
}: MapMarkerClickSheetContentProps) {
  return (
    <View className="h-full gap-3">
      {item.kind === "place" && <PlaceCard place={item} />}
      {item.kind === "route" && <RouteCard route={item} />}
    </View>
  );
}

"use client";

import { PlaceDetailSidePanel } from "@/entities/map";

export function PlaceDetailPanelClient({ placeId }: { placeId: string }) {
  return <PlaceDetailSidePanel placeId={placeId} />;
}

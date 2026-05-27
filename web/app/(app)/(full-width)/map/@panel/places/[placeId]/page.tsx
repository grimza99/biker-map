import { MapPanelFrame } from "../../_components/MapPanelFrame";
import { PlaceDetailPanelClient } from "../../_components/PlaceDetailPanelClient";

export default async function MapPlacePanelPage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;

  return (
    <MapPanelFrame title="장소 상세">
      <PlaceDetailPanelClient placeId={placeId} />
    </MapPanelFrame>
  );
}

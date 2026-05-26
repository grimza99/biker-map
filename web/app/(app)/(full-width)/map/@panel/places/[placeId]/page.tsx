import { MapPanelPlaceholder } from "../../_components/MapPanelPlaceholder";

export default async function MapPlacePanelPage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;

  return <MapPanelPlaceholder title={`장소 패널 자리: ${placeId}`} />;
}

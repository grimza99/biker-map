import { MapListPanelClient } from "../_components/MapListPanelClient";
import { MapPanelFrame } from "../_components/MapPanelFrame";

export default async function MapListPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const title = category === "route" ? "경로 목록" : "장소 목록";

  return (
    <MapPanelFrame title={title}>
      <MapListPanelClient />
    </MapPanelFrame>
  );
}

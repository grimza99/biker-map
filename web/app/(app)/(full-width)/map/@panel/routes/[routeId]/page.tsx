import { MapPanelFrame } from "../../_components/MapPanelFrame";
import { RouteDetailPanelClient } from "../../_components/RouteDetailPanelClient";

export default async function MapRoutePanelPage({
  params,
}: {
  params: Promise<{ routeId: string }>;
}) {
  const { routeId } = await params;

  return (
    <MapPanelFrame title="경로 상세">
      <RouteDetailPanelClient routeId={routeId} />
    </MapPanelFrame>
  );
}

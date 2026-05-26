import { MapPanelPlaceholder } from "../../_components/MapPanelPlaceholder";

export default async function MapRoutePanelPage({
  params,
}: {
  params: Promise<{ routeId: string }>;
}) {
  const { routeId } = await params;

  return <MapPanelPlaceholder title={`경로 패널 자리: ${routeId}`} />;
}

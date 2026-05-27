import { MapListPanelClient } from "../_components/MapListPanelClient";
import { MapPanelFrame } from "../_components/MapPanelFrame";

export default function MapListPanelPage() {
  return (
    <MapPanelFrame title="장소 목록">
      <MapListPanelClient />
    </MapPanelFrame>
  );
}

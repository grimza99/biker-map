import type { RouteMapPathItem } from "@package-shared/types/route";

type NaverMaps = typeof window.naver.maps;

export class RoutePolyline {
  private readonly polyline: any;

  constructor(
    private readonly maps: NaverMaps,
    private readonly map: any,
    private readonly route: RouteMapPathItem,
    private readonly onClick?: (route: RouteMapPathItem) => void
  ) {
    this.polyline = new this.maps.Polyline({
      map: null,
      path: route.path.map(
        (point) => new this.maps.LatLng(point.lat, point.lng)
      ),
      strokeColor: "#E5572F",
      strokeOpacity: 0.9,
      strokeWeight: 5,
      strokeLineCap: "round",
      strokeLineJoin: "round",
      clickable: true,
    });

    this.maps.Event.addListener(this.polyline, "click", () => {
      this.onClick?.(route);
    });
  }

  attach() {
    this.polyline.setMap(this.map);
  }

  detach() {
    this.polyline.setMap(null);
  }
}

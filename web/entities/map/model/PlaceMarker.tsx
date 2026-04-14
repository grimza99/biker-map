import type { PlaceCategory, PlaceListItem } from "@package-shared/types/place";
import {
  CircleEllipsis,
  Coffee,
  Drill,
  Droplet,
  type LucideIcon,
  ShoppingCart,
} from "lucide-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type NaverMaps = typeof window.naver.maps;

const categoryMarkerMeta: Record<
  PlaceCategory,
  { label: string; icon: LucideIcon; color: string }
> = {
  gas: {
    label: "주유소",
    icon: Droplet,
    color: "#E5572F",
  },
  repair: {
    label: "정비",
    icon: Drill,
    color: "#4DA3FF",
  },
  cafe: {
    label: "카페",
    icon: Coffee,
    color: "#00C2A8",
  },
  shop: {
    label: "상점",
    icon: ShoppingCart,
    color: "#FFC857",
  },
  rest: {
    label: "그외",
    icon: CircleEllipsis,
    color: "#8B7CF6",
  },
};

function renderMarkerIcon(Icon: LucideIcon) {
  return renderToStaticMarkup(
    createElement(Icon, {
      color: "#F5F7FA",
      size: 16,
      strokeWidth: 2.25,
    })
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildMarkerContent(place: PlaceListItem) {
  const meta = categoryMarkerMeta[place.category];

  return `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:${
      meta.color
    };border:2px solid rgba(17,19,21,0.88);box-shadow:0 10px 20px rgba(5,6,7,0.28);color:#F5F7FA;font-size:13px;font-weight:700;letter-spacing:-0.03em;">
     ${renderMarkerIcon(meta.icon)}
      
    </div>
  `;
}

export class PlaceMarker {
  private readonly marker: any;

  constructor(
    private readonly maps: NaverMaps,
    private readonly map: any,
    private readonly place: PlaceListItem
  ) {
    this.marker = new this.maps.Marker({
      map: this.map,
      position: new this.maps.LatLng(place.lat, place.lng),
      title: place.name,
      clickable: true,
      icon: {
        content: buildMarkerContent(place),
        anchor: new this.maps.Point(16, 16),
      },
    });

    this.maps.Event.addListener(this.marker, "click", () => {
      console.log(place);
    });
  }

  detach() {
    this.marker.setMap(null);
  }

  getInstance() {
    return this.marker;
  }
}

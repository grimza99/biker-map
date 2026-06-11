import type { PlaceListItem } from "@package-shared/types/place";
import type { RouteMapPathItem } from "@package-shared/types/route";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import type { ViewStyle } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { AppText } from "@/components/common";

type MapCanvasWebViewProps = {
  activeFilter: string;
  focusedPlaceId?: string | null;
  onMapReady?: () => void;
  onMarkerPressed?: (place: PlaceListItem) => void;
  onRoutePressed?: (route: RouteMapPathItem) => void;
  places: PlaceListItem[];
  routes?: RouteMapPathItem[];
};

type BridgeEvent =
  | { type: "MAP_READY" }
  | { payload?: { message?: string }; type: "MAP_ERROR" }
  | { payload: { place: PlaceListItem }; type: "MARKER_PRESSED" }
  | { payload: { route: RouteMapPathItem }; type: "ROUTE_PRESSED" }
  | {
      payload: {
        activeFilter: string;
        focusedPlaceId: string | null;
        places: PlaceListItem[];
        routes: RouteMapPathItem[];
      };
      type: "SET_MAP_DATA";
    };

type WebViewLoadErrorEvent = {
  nativeEvent: {
    description?: string;
  };
};

export function MapCanvasWebView({
  activeFilter,
  focusedPlaceId = null,
  onMapReady,
  onMarkerPressed,
  onRoutePressed,
  places,
  routes = [],
}: MapCanvasWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? "";

  const initialHtml = useMemo(() => buildMapHtml(clientId), [clientId]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const message: BridgeEvent = {
      type: "SET_MAP_DATA",
      payload: {
        activeFilter,
        focusedPlaceId,
        places,
        routes,
      },
    };

    webViewRef.current?.injectJavaScript(
      `window.__receiveFromNative?.(${JSON.stringify(message)}); true;`
    );
  }, [activeFilter, focusedPlaceId, isReady, places, routes]);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data) as BridgeEvent;

      if (data.type === "MAP_READY") {
        setIsReady(true);
        setErrorMessage(null);
        onMapReady?.();
        return;
      }

      if (data.type === "MAP_ERROR") {
        setIsReady(false);
        setErrorMessage(
          data.payload?.message ?? "네이버 지도를 불러오지 못했습니다."
        );
        return;
      }

      if (data.type === "MARKER_PRESSED") {
        onMarkerPressed?.(data.payload.place);
      }

      if (data.type === "ROUTE_PRESSED") {
        onRoutePressed?.(data.payload.route);
      }
    } catch {
      // ignore malformed bridge events
    }
  }

  function handleWebViewError(event: WebViewLoadErrorEvent) {
    setIsReady(false);
    setErrorMessage(
      event.nativeEvent.description || "지도 WebView를 불러오지 못했습니다."
    );
  }

  return (
    <View className="flex-1">
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: initialHtml, baseUrl: "http://localhost" }}
        onMessage={handleMessage}
        onError={handleWebViewError}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={webViewStyle}
      />

      {!isReady ? (
        <View className="absolute inset-0 items-center justify-center bg-[rgba(15,19,24,0.82)]">
          {errorMessage ? (
            <AppText className="px-7 text-center text-sm font-bold leading-5">
              {errorMessage}
            </AppText>
          ) : (
            <ActivityIndicator color={bikerMapTheme.colors.accent} />
          )}
        </View>
      ) : null}
    </View>
  );
}

function buildMapHtml(clientId: string) {
  const scriptUrl = clientId
    ? `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(
        clientId
      )}`
    : "";
  const serializedScriptUrl = JSON.stringify(scriptUrl);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #map {
        width: 100%;
        height: 100%;
        min-height: 100vh;
        overflow: hidden;
      }
      body {
        background: #111315;
      }
      #map {
        display: block;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      function postToNative(payload) {
        window.ReactNativeWebView?.postMessage(JSON.stringify(payload));
      }

      var map = null;
      var activeMarkers = [];
      var activeRoutePolylines = [];
      var sdkScriptUrl = ${serializedScriptUrl};

      var CATEGORY_COLORS = {
        gas: '#F3A43B',
        repair: '#E5572F',
        cafe: '#00C2A8',
        shop: '#7B9EFF',
        rest: '#A78BFA'
      };

      function makeMarkerContent(color, focused, name, address) {
        var safeName = escapeHtml(name);
        var safeAddress = escapeHtml(address);
        var dotSize = focused ? 16 : 12;
        var outline = focused ? ';outline:3px solid rgba(245,247,251,0.24)' : '';
        var dot = '<div style="position:relative;z-index:1;width:' + dotSize + 'px;height:' + dotSize + 'px;border-radius:50%;background:' + color + ';border:2.5px solid rgba(245,247,251,0.9);box-shadow:0 4px 12px rgba(0,0,0,0.4)' + outline + '"></div>';
        if (!focused) return dot;
        var card = '<div style="position:absolute;z-index:2;bottom:' + (dotSize + 6) + 'px;left:50%;transform:translateX(-50%);min-width:140px;padding:8px 10px;background:rgba(12,16,22,0.92);border-radius:10px;border:1px solid rgba(99,114,130,0.32);pointer-events:none;">'
          + '<div style="font-size:13px;font-weight:800;color:#f5f7fb;white-space:nowrap;">' + safeName + '</div>'
          + '<div style="font-size:11px;color:#8c97a6;margin-top:3px;white-space:nowrap;">' + safeAddress + '</div>'
          + '</div>';
        return '<div style="position:relative;width:' + dotSize + 'px;height:' + dotSize + 'px;">' + card + dot + '</div>';
      }

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function clearMarkers() {
        activeMarkers.forEach(function(m) { m.setMap(null); });
        activeMarkers = [];
      }

      function clearRoutePolylines() {
        activeRoutePolylines.forEach(function(polyline) { polyline.setMap(null); });
        activeRoutePolylines = [];
      }

      function extendBounds(bounds, position) {
        if (!bounds) {
          return new naver.maps.LatLngBounds(position, position);
        }

        bounds.extend(position);
        return bounds;
      }

      function renderMapData(payload) {
        clearMarkers();
        clearRoutePolylines();
        if (!map) return;

        var places = payload.places;
        var routes = payload.routes || [];
        var focusedId = payload.focusedPlaceId;
        var bounds = null;

        routes.forEach(function(route) {
          var path = Array.isArray(route.path) ? route.path : [];
          var naverPath = path
            .filter(function(point) {
              return Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng));
            })
            .map(function(point) {
              return new naver.maps.LatLng(Number(point.lat), Number(point.lng));
            });

          if (naverPath.length < 2) return;

          var polyline = new naver.maps.Polyline({
            map: map,
            path: naverPath,
            strokeColor: '#E5572F',
            strokeOpacity: 0.9,
            strokeWeight: 5,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            clickable: true
          });

          naver.maps.Event.addListener(polyline, 'click', function() {
            postToNative({ type: 'ROUTE_PRESSED', payload: { route: route } });
          });

          activeRoutePolylines.push(polyline);
          naverPath.forEach(function(position) {
            bounds = extendBounds(bounds, position);
          });
        });

        places.forEach(function(place) {
          var color = CATEGORY_COLORS[place.category] || '#E5572F';
          var isFocused = focusedId === place.id;
          var dotSize = isFocused ? 24 : 18;
          var position = new naver.maps.LatLng(place.lat, place.lng);

          var marker = new naver.maps.Marker({
            position: position,
            map: map,
            icon: {
              content: makeMarkerContent(color, isFocused, place.name, place.address),
              anchor: new naver.maps.Point(dotSize / 2, dotSize / 2)
            }
          });

          naver.maps.Event.addListener(marker, 'click', function() {
            postToNative({ type: 'MARKER_PRESSED', payload: { place: place } });
          });

          activeMarkers.push(marker);
          bounds = extendBounds(bounds, position);
        });

        if (bounds) {
          if (places.length === 1 && routes.length === 0) {
            map.setCenter(new naver.maps.LatLng(places[0].lat, places[0].lng));
          } else {
            map.fitBounds(bounds, { padding: 60 });
          }
        }
      }

      window.__receiveFromNative = function(message) {
        if (!message || !message.type) return;
        if (message.type === 'SET_MAP_DATA' || message.type === 'SET_PLACES') {
          renderMapData(message.payload);
        }
      };

      function initializeMap() {
        if (!window.naver || !window.naver.maps) {
          postToNative({
            type: 'MAP_ERROR',
            payload: { message: '네이버 지도 SDK 초기화에 실패했습니다.' }
          });
          return;
        }

        map = new naver.maps.Map('map', {
          center: new naver.maps.LatLng(37.5665, 126.9780),
          zoom: 13,
          mapDataControl: false,
          scaleControl: false,
          pinchZoom: true,
          zoomControl: false
        });
        postToNative({ type: 'MAP_READY' });
      }

      if (!sdkScriptUrl) {
        postToNative({
          type: 'MAP_ERROR',
          payload: { message: 'EXPO_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수가 없어 지도를 표시할 수 없습니다.' }
        });
      } else {
        var sdkScript = document.createElement('script');
        sdkScript.async = true;
        sdkScript.defer = true;
        sdkScript.src = sdkScriptUrl;
        sdkScript.onload = initializeMap;
        sdkScript.onerror = function() {
          postToNative({
            type: 'MAP_ERROR',
            payload: { message: '네이버 지도 스크립트 로드에 실패했습니다.' }
          });
        };
        document.head.appendChild(sdkScript);
      }
    </script>
  </body>
</html>`;
}

const webViewStyle: ViewStyle = {
  backgroundColor: "transparent",
  flex: 1,
};

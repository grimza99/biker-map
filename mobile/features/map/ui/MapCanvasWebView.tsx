import type { PlaceListItem } from "@package-shared/types/place";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { bikerMapTheme } from "@package-shared/constants/theme";

type MapCanvasWebViewProps = {
  activeFilter: string;
  focusedPlaceId?: string | null;
  onMapReady?: () => void;
  onMarkerPressed?: (placeId: string) => void;
  places: PlaceListItem[];
};

type BridgeEvent =
  | { type: "MAP_READY" }
  | { payload?: { message?: string }; type: "MAP_ERROR" }
  | { payload: { placeId: string }; type: "MARKER_PRESSED" }
  | {
      payload: {
        activeFilter: string;
        focusedPlaceId: string | null;
        places: PlaceListItem[];
      };
      type: "SET_PLACES";
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
  places,
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
      type: "SET_PLACES",
      payload: {
        activeFilter,
        focusedPlaceId,
        places,
      },
    };

    webViewRef.current?.injectJavaScript(
      `window.__receiveFromNative?.(${JSON.stringify(message)}); true;`
    );
  }, [activeFilter, focusedPlaceId, isReady, places]);

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
        onMarkerPressed?.(data.payload.placeId);
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
    <View style={styles.container}>
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
        style={styles.webView}
      />

      {!isReady ? (
        <View style={styles.loadingOverlay}>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
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

      function renderMarkers(payload) {
        clearMarkers();
        if (!map) return;

        var places = payload.places;
        var focusedId = payload.focusedPlaceId;
        var bounds = null;

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
            postToNative({ type: 'MARKER_PRESSED', payload: { placeId: place.id } });
          });

          activeMarkers.push(marker);

          if (!bounds) {
            bounds = new naver.maps.LatLngBounds(position, position);
          } else {
            bounds.extend(position);
          }
        });

        if (bounds) {
          if (places.length === 1) {
            map.setCenter(new naver.maps.LatLng(places[0].lat, places[0].lng));
          } else {
            map.fitBounds(bounds, { padding: 60 });
          }
        }
      }

      window.__receiveFromNative = function(message) {
        if (!message || !message.type) return;
        if (message.type === 'SET_PLACES') renderMarkers(message.payload);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(15, 19, 24, 0.82)",
    justifyContent: "center",
  },
  webView: {
    backgroundColor: "transparent",
    flex: 1,
  },
  errorText: {
    color: bikerMapTheme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    paddingHorizontal: 28,
    textAlign: "center",
  },
});

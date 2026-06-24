# 모바일 실시간 위치 공유 / Chat Handoff

## 1. 목적

- 이 문서는 `주변 바이커` 실시간 위치 공유의 현재 기준 문서이자, 이후 `chat` 작업자가 이어받을 handoff 문서다.
- source of truth는 `web`이며, 모바일은 `web BFF + package-shared` 계약을 소비한다.

## 2. 현재 결정 사항

- 위치 공유 상태는 `off | foreground`만 사용한다.
- `foreground`는 앱이 화면에 보이는 동안만 위치를 공유한다.
- foreground 위치 공유 업로드 기준은 `10초` 주기다.
- nearby 기본 반경은 `5000m`, 기본 `limit`은 `50`이다.
- stale timeout은 `30초`다.
- `biker_presence`는 위치 이력 테이블이 아니라 현재 공유 중인 유저의 최신 위치 1건만 보관하는 active presence 테이블이다.
- 사용자가 `sharingStatus=off`로 전환하거나 foreground 공유가 종료되면 presence row를 삭제한다.
- 앱이 foreground로 복귀하고 공유 의도가 여전히 on이면 첫 위치 update에서 presence row를 다시 생성하거나 upsert한다.
- stale row의 실제 삭제는 별도 작업으로 남겨 두고, 현재 nearby 조회는 `expires_at > now()` 기준으로만 active presence를 노출한다.
- MVP realtime transport는 `supabase-realtime`이다.
- WS feature는 `notifications`, `bikers-location`, `chat` 3개로 분리한다.

## 3. 현재 구현 상태

### Web / BFF

- `POST /api/mobile/bikers/me/sharing`
- `GET/POST /api/mobile/bikers/me/location`
- `GET /api/mobile/bikers/nearby`
- `GET /api/mobile/bikers/realtime-config`

반영됨:

- `sharingSessionId + sharingSessionVersion` 기반 세션 검증
- late location guard
- stale location / 미래 시각 `observedAt` / 날짜변경선 근처 거리 계산 대응
- `me/location` 성공 시 `biker:presence-sync` broadcast
- `me/sharing`의 `off` 처리 시 `biker:presence-leave` broadcast

### Mobile

반영됨:

- `mobile/app/(tabs)/bikers/index.tsx` 실제 위치 공유 화면 연결
- `useLiveBikers` 기반 `me/sharing -> me/location -> nearby snapshot` 흐름
- `MapCanvasWebView`의 `TBikerPresenceItem[]` marker 렌더링
- foreground/background 정책에 따른 sharing 세션 종료/재시작
- heartbeat 재업로드
- `supabase-realtime` subscribe
- `biker:presence-sync`, `biker:presence-leave` 수신 시 지도 state 반영
- realtime 연결 실패 시 자동 재시도 + 수동 `다시 연결` UX
- access token refresh 이후 realtime auth 최신 토큰 동기화

## 4. Realtime 공통 계층

### Shared

- [mobile/shared/lib/use-supabase-broadcast-realtime.ts](/Users/grimza/Desktop/side-project/biker-map-live-bikers-reconnect/mobile/shared/lib/use-supabase-broadcast-realtime.ts:1)
  - subscribe / unsubscribe
  - 최신 access token 반영
  - retry / reconnect
  - 수동 retry 상태 반환
- [mobile/shared/lib/fetch-supabase-broadcast-channel-config.ts](/Users/grimza/Desktop/side-project/biker-map-live-bikers-reconnect/mobile/shared/lib/fetch-supabase-broadcast-channel-config.ts:1)
  - feature별 realtime-config API 응답을 공통 `channelName` 설정으로 변환

### Biker Adapter

- [mobile/features/bikers/lib/live-biker-realtime.ts](/Users/grimza/Desktop/side-project/biker-map-live-bikers-reconnect/mobile/features/bikers/lib/live-biker-realtime.ts:1)
  - biker realtime config loader
  - `biker:presence-sync`, `biker:presence-leave` binding 생성

### Biker Domain Hook

- [mobile/features/bikers/hook/use-live-bikers.ts](/Users/grimza/Desktop/side-project/biker-map-live-bikers-reconnect/mobile/features/bikers/hook/use-live-bikers.ts:1)
  - 위치 공유 세션
  - 위치 업로드 / nearby snapshot
  - shared realtime hook 조합

## 5. Chat Handoff

`chat` 작업자는 chat 기능 자체를 새로 구현하되, 아래 공통 계층은 그대로 재사용하면 된다.

추천 구조:

- `mobile/features/chat/lib/chat-realtime.ts`
  - chat용 realtime config loader
  - chat event binding 생성
- `mobile/features/chat/hook/use-chat-realtime.ts` 또는 room hook
  - shared realtime hook 조합
  - chat domain state merge

추천 패턴:

1. chat BFF가 `realtime-config` route를 제공한다.
2. chat adapter가 `fetchSupabaseBroadcastChannelConfig()`를 사용해 `channelName`을 만든다.
3. chat adapter가 `SupabaseBroadcastBinding[]`를 만든다.
4. chat hook이 `useSupabaseBroadcastRealtime()`를 호출한다.
5. 메시지/typing/presence 반영은 chat domain에서만 처리한다.

공용으로 써야 하는 것:

- realtime 연결 lifecycle
- 토큰 반영
- retry / reconnect
- realtime-config 응답 해석

공용으로 빼지 말아야 하는 것:

- `sharingSessionId`, `sharingSessionVersion`
- biker marker merge/remove 규칙
- chat room/message/typing 도메인 규칙

## 6. 남은 항목

- 모바일 `sharingIntent` persistence 범위 확정
- 실기기 기준 background 복귀 / 네트워크 복귀 / 장시간 idle 수동 검증
- stale row 실제 삭제 시점과 운영 방식 확정
- cleanup 실패 로그와 운영 대응 기준 확정
- chat feature의 realtime adapter 구현

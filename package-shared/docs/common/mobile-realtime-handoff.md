# 모바일 실시간 위치 공유 / Chat Handoff

## 1. 목적

- 이 문서는 모바일 `Live-biker` 실시간 위치 공유의 현재 구현 기준선과, chat 작업자가 재사용해야 할 realtime 공통 계층을 함께 정리한다.
- source of truth는 `web`이며, 모바일은 `web BFF + package-shared` 계약을 소비한다.

## 2. 현재 결정 사항

- 위치 공유 상태는 `off | foreground`만 사용한다.
- `foreground`는 앱이 foreground에 있는 동안만 위치를 공유한다.
- 위치 업로드 기준 주기는 `10초`다.
- nearby 기본 반경은 `5000m`, 기본 `limit`은 `50`이다.
- stale timeout은 `30초`다.
- `biker_presence`는 최신 활성 위치 1건만 유지하는 active presence 테이블이다.
- `sharingStatus=off` 또는 foreground 공유 종료 시 presence row를 삭제한다.
- nearby 조회는 `expires_at > now()` 기준으로만 active presence를 노출한다.
- MVP realtime transport는 `supabase-realtime`이다.
- WS feature는 `notifications`, `bikers-location`, `chat` 3개로 분리한다.

## 3. 현재 구현 기준선

### Web / BFF

현재 모바일이 소비하는 route:

- `POST /api/mobile/bikers/me/sharing`
- `POST /api/mobile/bikers/me/location`
- `GET /api/mobile/bikers/nearby`
- `GET /api/mobile/bikers/realtime-config`

반영 완료:

- `sharingSessionId + sharingSessionVersion` 기반 세션 검증
- late location guard
- stale location / 미래 시각 `observedAt` 방어
- `me/location` 성공 시 `biker:presence-sync` broadcast
- `me/sharing`의 `off` 처리 시 `biker:presence-leave` broadcast

### Mobile

반영 완료:

- [mobile/app/(tabs)/bikers/index.tsx](</Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/app/(tabs)/bikers/index.tsx:19>)
  - 로그인 상태와 `user.isVerified`를 분리해 진입 제어
  - `anonymous`는 즉시 redirect하지 않고 Alert 후 auth 화면으로 유도
  - `authenticated + isVerified=false`는 화면 접근은 허용하되 지도, 위치 권한 요청, 위치 watch, nearby fetch, realtime 연결, 위치 공유를 모두 차단
  - 미인증 상태에서 `AuthVerifyDialog` 자동 오픈 + 재진입 CTA 유지
- [mobile/features/bikers/hook/use-live-bikers.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/hook/use-live-bikers.ts:45)
  - `me/sharing -> me/location -> nearby snapshot` 흐름
  - foreground/background 전환에 따른 sharing 세션 종료/재시작
  - heartbeat 재업로드
  - realtime 연결 실패 시 자동 재시도 + 수동 재연결
- [mobile/features/location/hooks/use-current-location.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/location/hooks/use-current-location.ts:14)
  - foreground 위치 권한 요청 및 `watchPositionAsync`
  - Live-biker 화면에서 `enabled`가 꺼지면 watch 시작 자체를 하지 않음
- [mobile/features/session/model/session-context.tsx](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/session/model/session-context.tsx:103)
  - 인증 후 `isVerified`가 갱신되면 앱 재시작 없이 세션 스냅샷이 즉시 갱신됨
- [mobile/features/auth/model/use-sms-verify-mutation.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/auth/model/use-sms-verify-mutation.ts:35)
  - 본인인증 성공 시 `me/session` 캐시와 세션 컨텍스트를 동시에 갱신

## 4. 운영 기준

### 접근 제어

- `anonymous`
  - Live-biker 기능 사용 불가
  - 조용한 redirect 금지
  - Alert로 로그인 필요 안내 후 auth 화면으로 이동
- `authenticated + isVerified=false`
  - 화면 접근은 허용
  - 지도 비노출
  - 위치 권한 요청 금지
  - 현재 위치 watch 금지
  - nearby 조회 금지
  - realtime 연결 금지
  - location sharing 시작 금지
  - `AuthVerifyDialog` 자동 노출
- `authenticated + isVerified=true`
  - 전체 Live-biker 기능 허용

### 화면 / 훅 경계

- 차단 조건은 화면에서 먼저 계산하고, 위치/실시간 훅에는 `enabled=false`로 전달한다.
- 위치 권한 요청이나 realtime subscribe를 훅 내부에서 강제로 우회 시작하지 않는다.
- 미인증 차단 UI는 앱 전용 UX이며, BFF가 강제 redirect 응답을 내려 모바일 흐름을 깨지 않게 유지한다.

## 5. Realtime 공통 계층

### Shared

- [mobile/shared/lib/use-supabase-broadcast-realtime.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/shared/lib/use-supabase-broadcast-realtime.ts:1)
  - subscribe / unsubscribe
  - 최신 access token 반영
  - retry / reconnect
  - 수동 retry 상태 반환
- [mobile/shared/lib/fetch-supabase-broadcast-channel-config.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/shared/lib/fetch-supabase-broadcast-channel-config.ts:1)
  - feature별 realtime-config API 응답을 공통 channel 설정으로 변환

### Biker Adapter

- [mobile/features/bikers/lib/live-biker-realtime.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/lib/live-biker-realtime.ts:1)
  - biker realtime config loader
  - `biker:presence-sync`, `biker:presence-leave` binding 생성

### Biker Domain Hook

- [mobile/features/bikers/hook/use-live-bikers.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/hook/use-live-bikers.ts:45)
  - 위치 공유 세션 관리
  - 위치 업로드 / nearby snapshot
  - realtime 공통 hook 조합

## 6. Chat handoff

chat는 이미 동일한 realtime 공통 계층을 재사용하는 방향으로 1차 구현이 들어가 있다.

현재 재사용 중인 구조:

- [mobile/features/bikers/lib/chat-realtime.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/lib/chat-realtime.ts:1)
  - chat realtime config loader
  - `chat:message`, `chat:typing`, `chat:presence` binding 생성
- [mobile/features/bikers/hook/use-chat-realtime.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/hook/use-chat-realtime.ts:11)
  - shared realtime hook 조합
  - online / typing 상태 관리

계속 공용으로 써야 하는 것:

- realtime 연결 lifecycle
- access token 반영
- retry / reconnect
- realtime-config 응답 해석

도메인별로 분리해야 하는 것:

- `sharingSessionId`, `sharingSessionVersion`
- biker marker merge/remove 규칙
- chat room/message/typing/presence 규칙

## 7. 남은 항목

- Live-biker `sharingIntent` persistence 범위 확정
- 실기기 기준 foreground 복귀 / 네트워크 복귀 / 장시간 idle 수동 검증
- stale row 실제 삭제 시점과 운영 방식 확정
- cleanup 실패 로그와 운영 대응 기준 확정
- chat transport를 외부 WebSocket으로 전환할지 여부는 여전히 보류

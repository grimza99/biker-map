# 모바일 실시간 위치 공유 작업 문서

## 1. 작업 목표

- `주변 바이커` 실시간 위치 공유 기능의 다음 단계로 `web BFF`, `DB`, `Realtime` 구조를 정리한다.
- 이미 확정한 `package-shared` 계약을 기준으로 서버 설계와 모바일 연동 순서를 구체화한다.
- 현재 문서는 "이미 반영된 기반 작업"과 "다음 구현 단계"를 구분해 관리한다.

## 2. 현재 결정 사항

- 위치 공유 상태는 `off | foreground`만 사용한다.
- `foreground`는 앱이 화면에 보이는 동안만 위치를 공유한다.
- 다른 앱으로 전환했다가 다시 돌아오면 위치 수집과 realtime 동기화를 다시 시작한다.
- foreground 위치 공유 업로드 기준은 `10초` 주기다.
- nearby 기본 반경은 `5000m`로 한다.
- nearby snapshot 기본 `limit`은 `50`이다.
- 최신 위치 상태 1건만 저장한다.
- stale timeout은 `30초`로 한다.
- `biker_presence`는 위치 이력 테이블이 아니라 현재 공유 중인 유저의 최신 위치 1건만 보관하는 active presence 테이블이다.
- 사용자가 `sharingStatus=off`로 전환하거나 foreground 공유가 종료되면 presence row를 삭제한다.
- 앱이 foreground로 복귀하고 사용자의 공유 의도가 여전히 on이면 첫 위치 update 시 presence row를 다시 생성하거나 upsert한다.
- MVP realtime transport는 `supabase-realtime`으로 진행한다.
- WS feature는 `notifications`, `bikers-location`, `chat` 3개로 분리한다.
- 구현 우선순위는 `notifications 유지 -> bikers-location 상세화 -> chat placeholder 유지`로 간다.

## 3. 현재까지 진행 완료

### Shared 계약

- `package-shared`에 live biker 관련 API path, 타입, 상수, ws event 타입이 반영되었다.
- 위치 공유 상태는 `off | foreground`로 고정되었다.
- nearby query/response, my sharing/location request/response 계약이 반영되었다.
- realtime event는 `biker:presence-sync`, `biker:presence-leave` 기준으로 정리되었다.

### DB / Migration

- `public.biker_presence` migration이 반영되었다.
- `public.biker_sharing_session` migration이 반영되었다.
- `biker_sharing_session.session_version` backfill 및 unique index가 반영되었다.
- 두 테이블의 RLS, 인덱스, `updated_at` trigger가 반영되었다.

### Web BFF

- `POST /api/mobile/bikers/me/sharing`가 구현되었다.
- `GET/POST /api/mobile/bikers/me/location`이 구현되었다.
- `GET /api/mobile/bikers/nearby`가 구현되었다.
- `sharingSessionId + sharingSessionVersion` 기반 세션 검증과 late location guard가 반영되었다.
- stale location, 미래 시각 `observedAt`, 날짜변경선 근처 거리 계산 이슈 대응이 반영되었다.
- `me/location` 성공 시 `biker:presence-sync` broadcast가 나가도록 구현되었다.
- `me/sharing`의 `off` 처리 시 `biker:presence-leave` broadcast가 나가도록 구현되었다.

### Mobile

- `mobile/app/(tabs)/bikers/index.tsx`가 placeholder에서 실제 위치 공유 화면으로 연결되었다.
- `useLiveBikers` 훅이 추가되어 `me/sharing -> me/location -> nearby snapshot` 흐름이 붙었다.
- `MapCanvasWebView`가 `TBikerPresenceItem[]` marker 렌더링을 지원하게 되었다.
- 앱이 background로 내려가면 foreground 공유 정책에 따라 sharing 세션을 종료하고, foreground 복귀 시 다시 sharing 세션을 시작하는 흐름이 반영되었다.
- 현재 모바일은 snapshot 기반 nearby 표시까지 구현되었고, realtime subscribe는 아직 미구현이다.

## 4. DB 최신 위치 상태 기준

### 테이블명

- `public.biker_presence`

### 역할

- 위치 이력 저장소가 아니다.
- 현재 위치 공유 중인 유저의 최신 위치 1건만 보관하는 active presence 테이블이다.
- 사용자가 `off`로 전환하거나 foreground 공유가 종료되면 row를 삭제한다.
- 앱이 foreground로 복귀하고 공유 의도가 여전히 on이면 첫 위치 update에서 row를 다시 생성하거나 upsert한다.

### 컬럼 기준

- `user_id uuid primary key`
  - `public.profiles(id)` FK
- `lat double precision not null`
- `lng double precision not null`
- `accuracy_meters double precision null`
- `heading double precision null`
- `speed_kph double precision null`
- `observed_at timestamptz not null`
  - 디바이스가 관측한 시각
- `expires_at timestamptz not null`
  - stale timeout 판정 기준
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### 제약 조건 기준

- `lat`는 `-90` 이상 `90` 이하여야 한다.
- `lng`는 `-180` 이상 `180` 이하여야 한다.
- `accuracy_meters`는 `0` 이상이어야 한다.
- `speed_kph`는 `0` 이상이어야 한다.
- `heading`은 `0` 이상 `360` 미만 또는 `null`이어야 한다.

### 인덱스 기준

- PK: `user_id`
- `expires_at`
  - stale row 제외와 정리 작업 기준
- `updated_at desc`
  - 최신 active presence 점검과 운영 확인용

### 조회/정리 원칙

- nearby snapshot 조회는 항상 `expires_at > now()` 조건을 전제로 한다.
- 본인 row는 nearby snapshot 응답에서 제외한다.
- 비정상 종료나 네트워크 단절로 `off` 호출이 누락될 수 있으므로 stale row 정리는 별도 필요하다.
- stale row 정리는 우선 조회 제외로 처리하고, 실제 삭제는 cron 또는 정리 작업으로 분리한다.

### 설계 메모

- 현재 baseline에는 `postgis`가 없다.
- MVP는 `lat/lng` 숫자 컬럼으로 시작하고, nearby 반경 필터는 BFF/SQL 단계에서 단순 bounding box + 추가 거리 계산 방식으로 처리한다.
- region/cell 기반 분할이나 공간 인덱스는 이후 scale 이슈가 생길 때 검토한다.

## 5. Realtime 흐름 기준

### 기본 원칙

- snapshot은 realtime으로 대체하지 않는다.
- 모바일은 최초 진입 또는 foreground 복귀 시 HTTP snapshot을 먼저 받는다.
- realtime은 snapshot 이후 발생하는 delta만 반영한다.
- MVP transport는 `supabase-realtime`이고, feature는 `bikers-location`이다.

### 목표 subscribe 순서

1. 모바일이 현재 위치를 확보한다.
2. `GET /api/mobile/bikers/nearby`로 snapshot을 조회한다.
3. `GET /api/mobile/bikers/realtime-config`로 transport mode와 channel을 받는다.
4. `bikers-location` channel을 subscribe 한다.
5. subscribe 이후 수신한 event를 현재 지도 state에 반영한다.

### event 종류

- `biker:presence-sync`
  - 어떤 유저의 최신 active presence가 생성되거나 갱신되었을 때 전파한다.
  - payload는 `TBikerPresenceItem` 기준으로 보낸다.
- `biker:presence-leave`
  - 어떤 유저의 active presence가 더 이상 유효하지 않을 때 전파한다.
  - 사용자가 `sharingStatus=off`로 전환해 row를 삭제했을 때 보낸다.
  - stale timeout 또는 정리 작업으로 row가 제거될 때도 같은 event를 사용한다.

### 서버 broadcast 기준

- `POST /me/location`
  - `biker_presence` upsert 성공 후 `biker:presence-sync` broadcast
- `POST /me/sharing` with `sharingStatus=off`
  - row 삭제 성공 후 `biker:presence-leave` broadcast
- stale cleanup
  - 만료된 row를 삭제한 뒤 `biker:presence-leave` broadcast

### 모바일 반영 기준

- `biker:presence-sync`
  - 같은 `userId`가 이미 있으면 marker를 갱신한다.
  - 없으면 새 marker를 추가한다.
  - `isMe`는 snapshot 또는 로컬 current user 기준으로 별도 처리한다.
- `biker:presence-leave`
  - 해당 `userId` marker를 지도 state에서 제거한다.

### 운영 메모

- channel은 MVP에서 전역 `bikers-location` 단일 채널로 시작한다.
- 이 구조는 반경 밖 유저 event도 받을 수 있으므로, 모바일은 현재 반경/지도 상태 기준으로 표시 여부를 한 번 더 필터링할 수 있다.
- 이후 scale 이슈가 생기면 region/cell 기반 채널 분리 또는 서버 scoped config로 확장한다.
- 현재는 서버 broadcast까지만 반영되었고, 모바일 subscribe/connect 단계는 아직 남아 있다.

## 6. 모바일 연동 순서 기준

### 로컬 상태

- `sharingIntent`
  - 사용자가 토글을 켜 두었는지 나타내는 앱 로컬 상태
  - 앱 foreground 복귀 시 위치 공유를 다시 시작할지 판단하는 기준
- `currentLocation`
  - `useCurrentLocation`이 수집한 최신 위치
- `nearbyBikers`
  - snapshot + realtime delta를 합쳐서 유지하는 지도 marker state
- `realtimeSubscription`
  - `bikers-location` channel subscription 핸들

### 현재 반영된 최초 진입 흐름

1. 사용자가 `주변 바이커` 화면에 진입한다.
2. 인증 상태를 확인한다.
3. `sharingIntent=off`면 현재 위치만 표시하고, 다른 유저 실시간 공유 흐름은 시작하지 않는다.
4. `sharingIntent=on`이면 foreground 위치 수집을 시작한다.
5. 첫 `currentLocation` 확보 후 아래 순서로 실행한다.
   - `POST /api/mobile/bikers/me/sharing`
   - `POST /api/mobile/bikers/me/location`
   - `GET /api/mobile/bikers/nearby`

### 현재 위치 update 주기

1. `useCurrentLocation`이 새 위치를 받는다.
2. 마지막 업로드 시점과 비교해 `10초`가 지났으면 업로드 대상으로 본다.
3. `POST /api/mobile/bikers/me/location`으로 최신 위치를 전송한다.
4. 성공 시 nearby snapshot을 다시 조회한다.

### 현재 토글 on

1. 사용자가 위치 공유 토글을 켠다.
2. `sharingIntent`를 로컬에 `on`으로 저장한다.
3. foreground 상태이면 `POST /api/mobile/bikers/me/sharing`으로 세션을 연다.
4. 첫 위치를 받으면 `POST /api/mobile/bikers/me/location`을 호출한다.
5. 이어서 nearby snapshot을 조회한다.

### 현재 토글 off

1. 사용자가 위치 공유 토글을 끈다.
2. `sharingIntent`를 로컬에 `off`로 저장한다.
3. `POST /api/mobile/bikers/me/sharing`에 `sharingStatus=off`를 보낸다.
4. sharing session과 nearby marker state를 정리한다.

### 현재 foreground -> background

1. 앱이 background로 전환된다.
2. `sharingIntent=on`이어도 foreground 정책이므로 위치 공유는 중단한다.
3. `POST /api/mobile/bikers/me/sharing`에 `sharingStatus=off`를 보낸다.
4. nearby marker state를 비운다.

### 현재 background -> foreground 복귀

1. 앱이 다시 foreground로 돌아온다.
2. `sharingIntent=off`면 위치 공유 흐름을 재시작하지 않는다.
3. `sharingIntent=on`이면 foreground 위치 수집을 다시 시작한다.
4. 첫 위치를 다시 받으면 아래 순서로 재동기화한다.
   - `POST /api/mobile/bikers/me/sharing`
   - `POST /api/mobile/bikers/me/location`
   - `GET /api/mobile/bikers/nearby`

### 에러 처리 기준

- 위치 권한 없음
  - 토글을 강제로 on으로 유지하지 않는다.
  - 권한 안내와 설정 이동 UX를 노출한다.
- `me/location` 업로드 실패
  - 다음 위치 주기에서 재시도한다.
  - 즉시 토글 off로 바꾸지 않는다.
- snapshot 실패
  - 우선 재시도 가능한 에러 상태로 둔다.
- realtime subscribe 실패
  - snapshot 기반 화면은 유지하고, 재연결 전략은 후속 단계에서 추가한다.

## 7. 이후 진행 예정 사항

1. `GET /api/mobile/bikers/realtime-config` route를 구현한다.
2. 모바일에서 `supabase-realtime` subscribe를 붙여 snapshot 이후 delta를 반영한다.
3. `biker:presence-sync`, `biker:presence-leave` 수신 시 `nearbyBikers` state merge/remove 로직을 추가한다.
4. stale presence 정리 cron 또는 cleanup job을 확정한다.
5. 모바일 `sharingIntent`의 persistence 범위를 정한다.

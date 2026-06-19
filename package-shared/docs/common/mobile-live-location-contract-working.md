# 모바일 실시간 위치 공유 작업 문서

## 1. 작업 목표

- `주변 바이커` 실시간 위치 공유 기능의 다음 단계로 `web BFF`, `DB`, `Realtime` 구조를 정리한다.
- 이미 확정한 `package-shared` 계약을 기준으로 서버 설계와 모바일 연동 순서를 구체화한다.

## 2. 현재 결정 사항

- 위치 공유 상태는 `off | foreground`만 사용한다.
- `foreground`는 앱이 화면에 보이는 동안만 위치를 공유한다.
- 다른 앱으로 전환했다가 다시 돌아오면 위치 수집과 realtime 동기화를 다시 시작한다.
- nearby 기본 반경은 `5000m`로 한다.
- 최신 위치 상태 1건만 저장한다.
- stale timeout은 `30초`로 한다.
- MVP realtime transport는 `supabase-realtime`으로 진행한다.
- WS feature는 `notifications`, `bikers-location`, `chat` 3개로 분리한다.
- 구현 우선순위는 `notifications 유지 -> bikers-location 상세화 -> chat placeholder 유지`로 간다.

## 3. Open Question

### Open Question 1

- 항목: 위치 update 업로드 기준
- 현재 가능한 선택지:
  - `time interval` 기준
  - `distance interval` 기준
  - `time + distance` 혼합
- 내가 우선 생각하는 방향:
  - `time + distance` 혼합

결정사항:

### Open Question 2

- 항목: nearby snapshot API 요청 shape
- 현재 가능한 선택지:
  - `lat/lng/radius`를 query로 전달
  - 현재 유저 위치는 서버 세션 기준, `radius`만 전달
  - `cursor/cell` 기반으로 별도 조회 계약
- 내가 우선 생각하는 방향:
  - MVP는 `lat/lng/radius`를 명시적으로 전달

결정사항:
- MVP nearby snapshot 요청은 `lat`, `lng`를 필수 query로 전달한다.
- 조회 반경은 `radiusMeters`를 사용하고, 미전달 시 서버 기본값 `5000m`를 적용한다.
- 이 결정은 현재 `package-shared/src/types/biker.ts`의 `TBikersNearbyQuery`와 동일하게 유지한다.

### Open Question 3

- 항목: realtime channel 스코프
- 현재 가능한 선택지:
  - 전역 `bikers-location` 채널
  - region/cell 기반 채널 분리
  - user scoped subscription config를 BFF가 동적으로 발급
- 내가 우선 생각하는 방향:
  - MVP는 단순 채널로 시작하되, 이후 cell 기반 분리를 염두에 둔 config 구조 유지

결정사항:

### Open Question 4

- 항목: 위치 공유 off 처리 시점
- 현재 가능한 선택지:
  - 사용자가 토글 off 할 때만
  - app background 진입 시 자동 off
  - background 진입 시 DB 상태는 유지하되 expires_at만 짧게 둠
- 내가 우선 생각하는 방향:
  - foreground 모드 기준으로 background 진입 시 자동 off 또는 즉시 만료 처리

결정사항:

### Open Question 5

- 항목: chat placeholder를 지금 어느 수준까지 열어둘지
- 현재 가능한 선택지:
  - feature enum만 유지
  - config + event 골격까지만 유지
  - room/message payload 초안까지 추가
- 내가 우선 생각하는 방향:
  - config + event 골격까지만 유지

결정사항:

## 4. 이후 진행 예정 사항

1. `web BFF` endpoint 초안 정리
   - `POST /api/mobile/bikers/me/location`
   - `POST /api/mobile/bikers/me/sharing`
   - `GET /api/mobile/bikers/nearby`
   - `GET /api/mobile/bikers/realtime-config`
2. `DB` 최신 위치 상태 테이블 초안 정리
   - `biker_presence` 기준
   - `user_id`, `location`, `updated_at`, `expires_at`, `sharing_status`
3. `Realtime` 흐름 초안 정리
   - snapshot은 HTTP + DB
   - delta는 Supabase Realtime Broadcast
4. 모바일 연동 순서 정리
   - foreground 위치 수집
   - update API 전송
   - nearby snapshot 조회
   - realtime subscribe

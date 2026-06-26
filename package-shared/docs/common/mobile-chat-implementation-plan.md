# 모바일 채팅 구현 기준 문서

## 문서 목적

- 대상 화면: `mobile/app/(tabs)/bikers/chats/[chatId].tsx`
- 목적: 모바일 채팅의 현재 구현 기준선, shared/BFF 계약, 남은 범위를 간단히 정리한다.
- 범위: 1:1 라이더 채팅의 방 진입, 메시지 조회/전송, realtime delta, typing/presence, 읽음 처리
- 비범위: 파일 업로드, 그룹 채팅, 푸시 fan-out, 신고/차단 UX 완성

## 현재 아키텍처 결론

- 채팅 MVP transport는 현재 `Supabase Broadcast`다.
- 메시지 저장/조회 source of truth는 `web BFF + DB`다.
- 모바일은 BFF API로 snapshot을 받고, realtime은 delta 수신에만 사용한다.
- transport는 교체 가능하게 유지한다. 장기 운영 아키텍처 후보는 여전히 `외부 WebSocket/API`다.

## 현재 구현 기준선

### Shared 계약

현재 반영 완료:

- `API_PATHS.bikers.ensureDirectChatRoom`
- `API_PATHS.bikers.chatRoom(chatId)`
- `API_PATHS.bikers.chatMessages(chatId)`
- `API_PATHS.bikers.chatRead(chatId)`
- `API_PATHS.bikers.chatRealtimeConfig(chatId)`
- `queryKeys.bikerChatRoom(chatId)`
- `queryKeys.bikerChatMessages(chatId, params)`
- `queryKeys.bikerChatRealtimeConfig(chatId)`
- `TChatRoom`
- `TChatMessage`
- `TChatMessageListResponseData`
- `TCreateChatMessageBody`
- `TCreateChatMessageResponseData`
- `TEnsureDirectChatRoomResponseData`
- `TMarkChatReadResponseData`
- `TChatRealtimeConfigResponseData`
- `package-shared/src/types/ws.ts`의 `chat`, `chat:message`, `chat:typing`, `chat:presence`

### Web / BFF

현재 모바일이 소비하는 route:

- `POST /api/mobile/bikers/chats/direct`
- `GET /api/mobile/bikers/chats/:chatId`
- `GET /api/mobile/bikers/chats/:chatId/messages`
- `POST /api/mobile/bikers/chats/:chatId/messages`
- `PATCH /api/mobile/bikers/chats/:chatId/read`
- `GET /api/mobile/bikers/chats/:chatId/realtime-config`

반영 완료:

- direct room 생성/재사용
- `chatId` UUID 검증
- room participant 권한 검증
- 메시지 저장 후 broadcast
- room별 realtime config 응답

### Mobile

반영 완료:

- [mobile/features/bikers/hook/use-chat-room.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/hook/use-chat-room.ts:1)
  - 채팅방 메타 / 참여자 정보 조회
- [mobile/features/bikers/hook/use-chat-messages.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/hook/use-chat-messages.ts:13)
  - HTTP snapshot 기반 메시지 조회
- [mobile/features/bikers/hook/use-send-chat-message-mutation.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/hook/use-send-chat-message-mutation.ts:19)
  - `clientMessageId` 기반 optimistic send
  - 서버 응답 / realtime delta를 같은 dedupe 규칙으로 병합
- [mobile/features/bikers/hook/use-chat-realtime.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/hook/use-chat-realtime.ts:11)
  - `chat:message`, `chat:typing`, `chat:presence`
  - reconnect / manual retry
  - online / typing 상태 관리
- [mobile/features/bikers/hook/use-mark-chat-read-mutation.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/hook/use-mark-chat-read-mutation.ts:10)
  - 마지막 읽은 메시지 기준 unread 갱신
- [mobile/features/bikers/hook/use-ensure-direct-chat-room-mutation.ts](/Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/features/bikers/hook/use-ensure-direct-chat-room-mutation.ts:10)
  - 주변 바이커 카드에서 direct room 생성/조회 후 진입
- [mobile/app/(tabs)/bikers/chats/[chatId].tsx](</Users/grimza/Desktop/side-project/biker-map-mobile-live-bikers-verification-guard/mobile/app/(tabs)/bikers/chats/[chatId].tsx:1>)
  - 실제 room/message 데이터 기반 화면
  - 상대 online / typing 상태 표시
  - unread 상태 표시
  - 전송 실패 Alert, realtime 재연결 CTA

## 현재 동작 원칙

### room 진입

1. direct room이 필요하면 `POST /api/mobile/bikers/chats/direct`를 먼저 호출한다.
2. 서버가 보장한 실제 `chat_rooms.id` UUID로 화면에 진입한다.
3. 화면은 `GET room`과 `GET messages` snapshot을 먼저 조회한다.
4. realtime 연결은 snapshot 이후 delta 반영 용도로 사용한다.

### 메시지 전송

- 메시지 전송은 `POST /api/mobile/bikers/chats/:chatId/messages`로 보낸다.
- `clientMessageId`는 request, optimistic item, 서버 응답, realtime payload 전 구간에서 유지한다.
- 중복 제거 기준은 `id` 또는 `clientMessageId`다.

### realtime

- room별 realtime 연결 정보는 `GET /realtime-config`에서 받는다.
- 모바일은 `useSupabaseBroadcastRealtime()` 공통 계층을 통해 subscribe 한다.
- presence/typing 실패는 채팅 연결 자체를 깨지 않도록 best-effort로 처리한다.
- reconnect 이후에는 cache patch가 우선이고, 필요 시 snapshot 재조회로 보정한다.

### 읽음 처리

- 화면은 최근 수신 메시지 기준으로 `PATCH /read`를 호출한다.
- unread count source of truth는 room snapshot이다.
- 읽음 처리 실패는 화면을 깨지 않고 다음 진입/갱신 시 재시도 가능하게 둔다.

## 현재 미구현 또는 후속 항목

- 메시지 pagination UI와 상단 prepend UX
- reconnect 이후 snapshot 재보정 범위 최적화
- 차단 / 신고 / room 생성 제한 정책
- push notification 연동
- 파일 업로드 / 이미지 전송
- 장기 transport를 외부 WebSocket/API로 전환할지 여부 확정

## 설계 원칙

- source of truth는 `web`이다.
- 모바일은 Supabase에 직접 붙는 것을 기본값으로 삼지 않고, 웹 BFF API contract를 우선 소비한다.
- 인증은 `Authorization: Bearer <access-token>`만 사용한다.
- refresh token은 `X-Refresh-Token` 계약을 따른다.
- 모바일 요청은 `X-Client-Platform: mobile`을 보낸다.
- path, enum, 타입은 `package-shared`를 기준으로 맞춘다.

## 운영 메모

- 현재 chat realtime은 Live-biker와 동일한 `supabase-realtime` 공통 계층을 재사용한다.
- 따라서 access token refresh 이후 재연결, app foreground 복귀, network flap QA는 live-biker와 함께 묶어서 확인하는 편이 효율적이다.
- 다만 장기적으로 채팅을 별도 WebSocket 계층으로 분리할 가능성은 여전히 열어 둔다.

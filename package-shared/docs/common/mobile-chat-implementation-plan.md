# 모바일 채팅 착수 문서

## 문서 목적

- 대상 화면: `mobile/app/(tabs)/bikers/chats/[chatId].tsx`
- 목적: 모바일 채팅 화면 구현 착수 전제, 선택 아키텍처, 1차 구현 범위, 진행 상태를 함께 관리한다.
- 범위: 1:1 라이더 채팅의 메시지 송수신, 최근 메시지 조회, typing/presence, 권한 검증
- 비범위: 파일 업로드, 이미지/동영상 전송, 읽음 수 동기화, 푸시 알림 상세 설계, 그룹 채팅

## 착수 결론

- 채팅은 `Supabase Broadcast`로 MVP를 시작한다.
- 단, 메시지 저장/조회 source of truth는 처음부터 `web BFF + DB`로 둔다.
- 모바일 화면은 transport를 직접 알지 않고, 이후 외부 API 전환이 가능하도록 hook/adapter 뒤에 숨긴다.
- 장기 운영 아키텍처 후보는 여전히 `Vercel + Next.js + 외부 API`를 유지한다.

## 이번 착수 범위

- 1차 목표는 `package-shared` chat 엔티티 타입과 공통 contract를 확정하는 것이다.
- 현재는 화면 구현이나 BFF route 추가보다 먼저, 웹/모바일이 함께 쓸 타입과 path, query key를 고정한 상태다.
- realtime 공용화는 기존 `live-bikers`가 이미 쓰는 `createSupabaseRealtimeClient()`와 subscribe 패턴을 재사용하는 방향으로 본다.
- 다만 아직 별도 공용 chat realtime adapter는 만들지 않고, 2차 구현에서 hook 레벨로 분리한다.

## 현재 상태

- `mobile/app/(tabs)/bikers/chats/[chatId].tsx`는 placeholder 화면이다.
- 현재 화면은 `chatId` route param만 받고, 테스트 메시지 2건과 입력창만 렌더링한다.
- 실제 데이터 fetch, 권한 검증, 메시지 전송, 실시간 연결은 아직 없다.
- `package-shared/src/types/ws.ts`에는 `chat` feature와 `chat:message`, `chat:typing`, `chat:presence` event 타입이 이미 잡혀 있다.
- 다만 이 타입 존재만으로 "레포가 이미 외부 WebSocket 서버 방향으로 확정되어 있었다"라고 단정하긴 어렵다.
- 현재 코드베이스 맥락상 이 타입은 "chat realtime 이벤트가 필요할 것"이라는 공유 모델 선반영에 가깝고, 실제 transport 결정은 아직 열려 있던 상태로 보는 편이 맞다.
- 현재 레포의 명시적 방향은 "채팅은 Supabase Realtime만으로 확정하지 않고 별도 WebSocket 서버 도입 가능성을 검토"하는 쪽이다.

## 현재 진행 현황

### 완료된 항목

- `package-shared/src/types/chat.ts` 추가
- `package-shared/src/types/index.ts` export 추가
- `package-shared/src/constants/api.ts`에 chat room/messages/realtime-config path 추가
- `package-shared/src/constants/query-keys.ts`에 chat room/messages/realtime-config key 추가
- `package-shared/src/types/ws.ts`에서 `chat:message` event가 `TChatMessage` payload를 직접 참조하도록 정리

### 확정된 shared 계약

- `TChatParticipantProfile`
- `TChatParticipant`
- `TChatMessagePreview`
- `TChatMessage`
- `TChatRoom`
- `TChatMessagesQuery`
- `TChatRoomResponseData`
- `TChatMessageListResponseData`
- `TCreateChatMessageBody`
- `TCreateChatMessageResponseData`

### 재사용 기준

- realtime client 생성은 새로 만들지 않고 기존 `mobile/shared/lib/supabase-realtime.ts`의 `createSupabaseRealtimeClient()`를 재사용한다.
- 모바일 subscribe 흐름은 `mobile/features/bikers/hook/use-live-bikers.ts`의 auth 주입, channel subscribe, cleanup 패턴을 참고해 chat hook으로 옮긴다.
- retry 정책은 화면별 ad-hoc 구현 대신 기존 Query 기본 정책과 `live-bikers`의 reconnect 처리 방식을 우선 재사용한다.

### 아직 남은 2차 구현

- BFF chat room/messages/realtime-config route 추가
- DB chat room/participant/message 최소 스키마 확정
- 모바일 `useChatRoom`, `useChatMessages`, `useChatRealtime` 또는 `useChatConnection` 분리
- `mobile/app/(tabs)/bikers/chats/[chatId].tsx`를 placeholder에서 실제 데이터 기반 화면으로 전환

## 전제

- source of truth는 `web`이다.
- 모바일은 Supabase에 직접 붙는 것을 기본값으로 삼지 않고, 웹 BFF API contract를 우선 소비한다.
- 인증은 `Authorization: Bearer <access-token>`을 사용한다.
- refresh token은 `Authorization`에 섞지 않고 `X-Refresh-Token` 계약을 따른다.
- 모바일 요청은 `X-Client-Platform: mobile`을 고려한다.
- 앱과 웹이 함께 쓰는 path, enum, 타입은 `package-shared`에 둔다.

## 공통 요구사항

### 최소 기능 요구

- 채팅방 진입 시 사용자가 해당 방 참여자인지 확인해야 한다.
- 최근 메시지 snapshot을 HTTP로 먼저 받아야 한다.
- 실시간 연결은 snapshot 이후 delta만 반영해야 한다.
- 메시지 전송 실패, 중복 전송, 재연결 후 누락 메시지 보정 흐름이 있어야 한다.
- typing, join/leave는 보조 이벤트로 취급하고 메시지 저장 성공보다 우선하지 않는다.

### shared 계약 기준

현재 반영 완료:

- `API_PATHS.bikers.chatRoom(chatId)`
- `API_PATHS.bikers.chatMessages(chatId)`
- `API_PATHS.bikers.chatRealtimeConfig(chatId)`
- `queryKeys.bikerChatRoom(chatId)`
- `queryKeys.bikerChatMessages(chatId, params)`
- `queryKeys.bikerChatRealtimeConfig(chatId)`
- `TChatRoom`
- `TChatMessage`
- `TChatMessageListResponseData`
- `TCreateChatMessageBody`

## 비교 대상

### 1. Vercel + Next.js + 외부 API

의미:

- 웹 BFF는 Next.js API route로 유지한다.
- 실시간 연결은 외부 WebSocket API 또는 managed realtime 서비스가 담당한다.
- 모바일은 메시지 저장/조회는 BFF HTTP로, 실시간 송수신은 BFF가 발급한 접속 정보로 외부 API에 연결한다.

### 2. Supabase Broadcast

의미:

- 메시지 저장은 BFF 또는 Supabase DB를 거친다.
- 실시간 fan-out은 Supabase Realtime Broadcast channel을 사용한다.
- 모바일은 Supabase Realtime client로 room channel을 subscribe 한다.

## 방식별 상세 비교

### 1) Vercel + Next.js + 외부 API

#### 아키텍처

권장 흐름:

1. 모바일이 `GET /api/mobile/bikers/chats/:chatId`로 방 메타와 참여 권한을 확인한다.
2. 모바일이 `GET /api/mobile/bikers/chats/:chatId/messages`로 최근 메시지 snapshot을 받는다.
3. 모바일이 `GET /api/mobile/bikers/chats/:chatId/realtime-config`를 호출한다.
4. BFF가 access token을 검증하고, 외부 realtime 서비스용 short-lived token 또는 signed config를 발급한다.
5. 모바일이 외부 WebSocket endpoint에 연결한다.
6. 메시지 전송은 기본적으로 `POST /api/mobile/bikers/chats/:chatId/messages`로 보낸다.
7. 서버가 DB 저장 성공 후 외부 realtime으로 `chat:message` event를 publish 한다.

구성 요소:

- Next.js BFF
- 채팅 메시지 저장용 DB 테이블
- 외부 realtime 서비스
- 모바일 WebSocket client

#### 모바일 앱 영향

- `BikerChatScreen`은 HTTP snapshot hook과 socket hook으로 분리해야 한다.
- `chatId`만으로는 부족하고, 방 메타, 상대 프로필, 연결 상태, pagination 상태가 필요하다.
- 앱은 foreground/background 전환 시 socket reconnect와 missed message 보정 로직이 필요하다.
- typing, join/leave는 socket hook 내부에서 throttling/debouncing 처리해야 한다.
- TanStack Query로 snapshot cache를 유지하고 socket event는 cache patch 방식으로 반영하는 편이 안전하다.

#### 인증 / 권한

- 모바일 -> BFF: `Authorization` bearer token 필수
- BFF는 `requireApiSession(request)`로 사용자 검증 후 room participant 여부를 체크해야 한다.
- 외부 realtime 연결 정보는 BFF가 room 범위와 만료 시간을 가진 short-lived token으로 내려주는 방식이 적합하다.
- 모바일은 refresh token을 socket 서버로 직접 보내지 않는다.
- room join 권한, message write 권한, typing/presence publish 권한을 분리해서 본다.

#### 구현 순서

1. `package-shared`에 chat path, query key, DTO를 추가한다.
2. DB에 `chat_rooms`, `chat_room_participants`, `chat_messages` 같은 최소 스키마를 설계한다.
3. BFF에 room detail, message list, send message API를 만든다.
4. 외부 realtime provider 연동용 server helper를 만든다.
5. `GET /realtime-config`에서 short-lived 접속 정보를 발급한다.
6. 모바일에 `useChatRoom`, `useChatMessages`, `useChatSocket`을 분리 구현한다.
7. reconnect, duplicate message, pagination, optimistic UI를 붙인다.

#### 장점

- 채팅 기능을 위치 공유/알림과 인프라적으로 분리할 수 있다.
- room 수, 동시 접속자 수, typing/presence 증가에 더 유연하다.
- 채팅 delivery 정책, ack, ordering, retry를 별도 서버 정책으로 확장하기 쉽다.
- 이후 그룹 채팅, 읽음 처리, 푸시 fan-out으로 확장하기 유리하다.

#### 단점

- 인프라가 하나 더 늘어난다.
- BFF, DB, 외부 realtime 간 책임 경계 설계가 필요하다.
- 초기 구현량이 Supabase Broadcast보다 크다.
- 로컬/스테이징 환경 재현이 더 번거롭다.

#### 비용 / 운영 리스크

- 외부 provider 비용이 추가된다.
- 장애 지점이 `Vercel + DB + 외부 realtime` 3개로 늘어난다.
- provider rate limit, connection cap, vendor lock-in 검토가 필요하다.
- 반대로 chat 트래픽이 커질수록 Supabase Broadcast보다 비용 예측과 운영 분리가 쉬울 가능성이 높다.

### 2) Supabase Broadcast

#### 아키텍처

권장 흐름:

1. 모바일이 `GET /api/mobile/bikers/chats/:chatId`로 권한을 확인한다.
2. 모바일이 `GET /api/mobile/bikers/chats/:chatId/messages`로 최근 메시지 snapshot을 받는다.
3. 모바일이 `GET /api/mobile/bikers/chats/:chatId/realtime-config`를 호출한다.
4. BFF는 room channel 이름과 mode=`supabase-realtime`을 반환한다.
5. 모바일은 Supabase Realtime client로 해당 room broadcast channel에 subscribe 한다.
6. 메시지 전송은 `POST /api/mobile/bikers/chats/:chatId/messages`로 보낸다.
7. 서버가 DB 저장 성공 후 해당 room channel에 `chat:message` broadcast를 보낸다.

주의:

- 모바일이 DB row change를 직접 구독하는 구조보다, BFF가 메시지 저장 후 broadcast 하는 구조가 현재 원칙과 더 맞다.
- room 권한 확인 없이 클라이언트가 임의 channel subscribe를 시도하지 않게 설계해야 한다.

#### 모바일 앱 영향

- 위치 공유에 이미 쓰는 Supabase Realtime client 패턴을 재사용할 수 있다.
- `useChatRealtime` 훅을 `useLiveBikers`와 유사한 구조로 구현할 수 있다.
- 다만 socket 연결은 하나여도 feature channel이 늘어나므로 auth refresh 이후 reconnect QA가 중요하다.
- background 복귀 시 snapshot 재조회 후 subscribe 재개 흐름이 필요하다.

#### 인증 / 권한

- 모바일 -> BFF 인증은 기존 모바일 auth contract를 그대로 따른다.
- BFF는 사용자 room 참여 여부를 검증한 뒤 channel 이름만 내려주면 부족할 수 있다.
- Supabase Broadcast 자체 권한 모델이 room participant 단위로 충분히 세밀하지 않으면, channel 이름 노출만으로 우회 구독 위험이 생길 수 있다.
- 이를 줄이려면 room마다 예측 불가능한 channel naming, private channel 정책, 서버 측 join gate 검토가 필요하다.
- refresh token은 여기서도 Realtime에 직접 쓰지 않는다.

#### 구현 순서

1. `package-shared`에 chat path, query key, DTO를 추가한다.
2. DB에 최소 chat 스키마를 설계한다.
3. BFF에 room detail, message list, send message API를 만든다.
4. BFF에 `GET /realtime-config`를 만들고 room별 channel naming 규칙을 정한다.
5. 모바일에 `useChatRoom`, `useChatMessages`, `useChatRealtime`을 구현한다.
6. server broadcast와 mobile subscribe를 연결한다.
7. reconnect, 중복 제거, 누락 보정, typing throttle을 붙인다.

#### 장점

- 현재 레포에 이미 있는 Supabase Realtime 경험을 재사용할 수 있다.
- 초기 구현 속도가 빠르다.
- 별도 realtime provider 운영이 필요 없다.
- MVP나 내부 검증 단계에서 가장 적은 조립 비용으로 동작 확인이 가능하다.

#### 단점

- 레포의 현재 방향성과 다르게 채팅을 Realtime에 얹는 결정이 된다.
- 채팅 트래픽이 커지면 알림/위치 공유와 같은 계열로 묶여 운영 경계가 흐려질 수 있다.
- room 권한 모델과 channel 은닉 전략을 약하게 잡으면 보안 설계가 애매해질 수 있다.
- 메시지 ack, ordering, large room fan-out, delivery 보장 같은 요구가 커질수록 한계가 빨리 드러날 수 있다.

#### 비용 / 운영 리스크

- 초기 추가 비용은 작다.
- 하지만 채팅이 활성화되면 Realtime 연결 수, broadcast volume, reconnect 부하가 위치 공유/알림과 경쟁할 수 있다.
- 장애가 나면 알림, 위치 공유, 채팅이 같은 계층에서 함께 흔들릴 가능성이 있다.
- 운영상 "빠른 MVP"에는 유리하지만 "채팅 전용 안정성"은 약하다.

## 항목별 요약 비교

| 항목 | Vercel + Next.js + 외부 API | Supabase Broadcast |
| --- | --- | --- |
| 초기 구현 속도 | 느림 | 빠름 |
| 현재 모바일/BFF 원칙 적합성 | 높음 | 중간 |
| 채팅 전용 확장성 | 높음 | 중간 이하 |
| 권한 모델 명확성 | 높음 | 중간 |
| 초기 운영 복잡도 | 높음 | 낮음 |
| 장기 운영 분리 | 높음 | 낮음 |
| 위치 공유/알림과의 결합도 | 낮음 | 높음 |

## 권장 전략

### 기본 전략

- 권장 방향: `Supabase Broadcast로 MVP를 시작하되, 외부 API로 이행 가능한 구조로 제한해서 설계`

### 의미

- MVP 단계에서는 `2) Supabase Broadcast`를 transport로 사용할 수 있다.
- 단, 메시지 저장/조회의 source of truth는 처음부터 `web BFF + DB`로 둔다.
- 모바일 화면은 transport 구현 세부사항을 직접 알지 않게 하고, hook 또는 adapter 뒤에 숨긴다.
- 이후 외부 API 전환 시 `realtime-config 발급부`와 `connection adapter`만 교체하는 구조를 목표로 한다.

### 구체 원칙

- `GET room`, `GET messages`, `POST message`는 처음부터 BFF 계약으로 고정한다.
- realtime은 항상 snapshot 이후 delta만 반영한다.
- `package-shared/src/types/ws.ts`의 event 타입은 유지하되, 특정 vendor 전용 payload로 오염시키지 않는다.
- 모바일은 `useChatConnection(chatId)` 같은 추상화만 사용하고, 화면에서 Supabase client를 직접 다루지 않는다.
- `GET /api/mobile/bikers/chats/:chatId/realtime-config`는 장기적으로 `mode: "supabase-realtime" | "websocket"` 분기를 유지할 수 있어야 한다.

### 추천
- 운영 장기안: `1) Vercel + Next.js + 외부 API`
- 현실적 MVP안: `2) Supabase Broadcast`
- 단, MVP안은 "교체 가능한 transport"라는 제약을 반드시 건다.

### 추천 이유

- 현재 레포 문서와 skill은 채팅을 Supabase Realtime에 영구 고정하지 말고 별도 WebSocket 서버 도입 가능성을 먼저 보라고 일관되게 안내한다.
- 그렇다고 MVP 단계에서도 바로 외부 API를 붙여야만 하는 것은 아니다.
- 실제로는 Supabase Broadcast가 가장 빠른 검증 경로이므로, 전환 비용만 통제된다면 MVP transport로는 실용적이다.
- 채팅은 위치 공유와 달리 message ordering, resend, reconnect, typing, presence, unread 같은 요구가 빠르게 붙는다.
- 모바일 auth contract 관점에서도, 현재든 이후든 BFF가 room 권한을 먼저 검증하는 구조는 유지해야 한다.
- 장기적으로 위치 공유와 채팅을 같은 realtime 계층에 과도하게 묶지 않는 편이 운영 리스크가 낮다.
- 따라서 "지금은 Supabase Broadcast, 이후 필요 시 외부 API 전환"이 가장 현실적인 절충안이다.

## Supabase Free Plan 검토

### 2026-06-23 확인 기준

Supabase 공식 문서 기준으로 확인한 값:

- Realtime messages quota: Free plan 월 `2 million`
- Realtime peak connections: Free plan `200`
- Realtime messages per second: Free plan `100`
- Channel joins per second: Free plan `100`
- Channels per connection: `100`
- Broadcast payload size: Free plan `256 KB`

### 해석

- 소규모 내부 테스트나 아주 작은 MVP는 가능하다.
- 하지만 이 프로젝트는 이미 알림, 위치 공유, 채팅이 모두 realtime 후보로 잡혀 있다.
- 따라서 free plan에서 "충분히 넉넉하다"라고 보긴 어렵다.
- 특히 background/foreground 복귀가 잦은 모바일 특성상 reconnect와 join 트래픽이 생각보다 빨리 누적될 수 있다.

### 판단

- 개발 초기 로컬/내부 QA 수준에서는 free plan으로 시작 가능성이 있다.
- 그러나 외부 테스트 인원이 조금만 늘어도 realtime quota와 peak connection 여유가 빠르게 줄 수 있다.
- 채팅을 실제 사용자 대상 MVP로 노출할 계획이면 최소한 usage 대시보드와 상한 관리 전제를 깔고 봐야 한다.
- 즉, "free plan이라서 무조건 불가능"은 아니지만 "free plan이면 안심하고 운영 가능"도 아니다.

## 권장 구현 방향

### 1단계: 계약과 데이터 모델 정리

- `package-shared`에 chat API path, query key, room/message DTO를 추가한다.
- DB 최소 스키마와 권한 규칙을 먼저 정리한다.
- `chatId`가 어떤 기준으로 생성되는지, 1:1 room 고정 규칙이 있는지 명시한다.

### 2단계: HTTP snapshot 우선

- `GET room`
- `GET messages`
- `POST message`

이 3개를 먼저 BFF로 완성한다.

### 3단계: MVP realtime 연결 추가

- 우선 Supabase Broadcast를 붙인다.
- `GET realtime-config`는 mode=`supabase-realtime`를 반환한다.
- 모바일은 adapter 인터페이스를 통해 subscribe 한다.
- 화면 컴포넌트는 Supabase 전용 구현을 직접 알지 않는다.

### 4단계: 외부 API 전환 대비 포인트

- event payload는 `package-shared` 타입을 그대로 유지한다.
- room/channel 식별자는 transport 내부 규칙으로 숨긴다.
- `sendMessage` 성공 후 cache patch 규칙을 transport와 분리한다.
- reconnect 후 snapshot 재조회 규칙을 transport 공통 정책으로 유지한다.

### 5단계: 필요 시 외부 API 전환
- 외부 realtime provider를 붙인다.
- `GET realtime-config`에서 room 범위 short-lived token을 발급한다.
- mobile adapter 구현체만 교체하고 화면/DTO/BFF snapshot 계약은 유지한다.

### 6단계: UX 보강

- optimistic send
- reconnect 배너
- duplicate 제거
- pagination
- typing indicator

## 모바일 화면 구현 메모

- `mobile/app/(tabs)/bikers/chats/[chatId].tsx`는 화면 조합만 담당하고, API/실시간 로직은 hook으로 분리한다.
- 권장 분리:
  - `useChatRoom(chatId)`
  - `useChatMessages(chatId)`
  - `useChatConnection(chatId)`
  - `useSendChatMessage(chatId)`
- 입력창은 safe area와 키보드 회피를 유지하되, send pending 상태와 reconnect 상태를 표시해야 한다.
- 초기에는 `ScrollView`보다 `FlatList` 역순 렌더링을 검토하는 편이 메시지 수 증가에 유리하다.

## 앱 QA 시나리오

- 방 참여자가 아닌 사용자가 `chatId` URL로 직접 진입할 때 차단되는지
- 최초 진입 시 snapshot이 먼저 보이고 이후 delta가 붙는지
- 메시지 전송 직후 중복 bubble이 생기지 않는지
- 앱 background 후 foreground 복귀 시 누락 메시지가 보정되는지
- access token 만료 후 refresh 뒤에도 채팅 재연결이 복구되는지
- 상대방이 퇴장하거나 room 권한이 제거되었을 때 연결이 정리되는지

## 남은 리스크

- Supabase Broadcast를 MVP로 선택하면 free plan 한도 안에서 충분한지 실제 사용량 관측이 필요하다.
- 외부 realtime provider를 무엇으로 고를지 아직 미정이다.
- 1:1 채팅 room 생성 규칙과 차단/신고 정책이 아직 정의되지 않았다.
- unread count와 push notification 연동 시 BFF 이벤트 설계가 추가로 필요하다.
- `package-shared/src/types/ws.ts`에는 event 껍데기만 있고 실제 room/message DTO는 아직 없다.

## 결론

- 현실적인 추천안은 `Supabase Broadcast로 MVP를 먼저 진행하되, 외부 API로 이행 가능한 구조로 제한해서 설계`하는 것이다.
- 장기 운영 기준 아키텍처 우선순위는 여전히 `Vercel + Next.js + 외부 API` 쪽이 더 안전하다.
- 따라서 `mobile/app/(tabs)/bikers/chats/[chatId].tsx`는 "HTTP snapshot을 BFF로 먼저 붙이고, realtime은 transport adapter 뒤에 숨겨 MVP에서는 Supabase, 이후에는 외부 API로 교체 가능한 구조"로 설계하는 것이 적절하다.

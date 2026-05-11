# Biker Map

바이커를 위한 장소 탐색, 드라이브 경로, 커뮤니티 기능을 웹과 앱으로 함께 운영하기 위한 모노레포입니다.

이 저장소는 단순히 화면을 모아둔 곳이 아닙니다. 웹과 앱이 같은 계약을 공유하고, Supabase를 백엔드로 사용하며, 공통 타입과 API 경계를 `package-shared`로 고정해서 한쪽 구현이 다른 쪽을 깨뜨리지 않도록 관리하는 것을 목표로 합니다.

## 프로젝트 목표

- 바이커 친화 장소를 지도에서 탐색합니다.
- 운영자 큐레이션 경로와 사용자 경로를 분리해서 제공합니다.
- 게시글, 댓글, 대댓글, 반응, 알림을 갖춘 커뮤니티를 운영합니다.
- 웹과 앱이 같은 도메인 모델을 참조하도록 유지합니다.

## 저장소 구조

```text
biker-map/
├─ web/             Next.js 웹 앱
├─ mobile/          Expo 기반 모바일 앱
├─ package-shared/  웹/앱 공용 타입, 상수, 모델, 계약
├─ supabase/        SQL migration 및 DB 관련 산출물
└─ README.md
```

### `web`

Next.js 16 App Router 기반 웹 애플리케이션입니다.

- 지도
- 커뮤니티
- 경로 상세/목록
- 내 정보 / 내 경로 / 좋아요 목록
- 관리자 페이지
- 웹 API route

구현 스타일은 FSD에 가깝게 나누고 있습니다.

- `app/`: 페이지와 API route
- `entities/`: 도메인 단위 UI/모델
- `features/`: 사용자 액션 단위 로직
- `widgets/`: 여러 feature/entity를 조합한 화면 블록
- `shared/`: 공용 유틸, API helper, UI, Supabase client

### `mobile`

Expo Router 기반 모바일 앱입니다. 현재는 탭 셸과 인증 흐름, 공통 구조를 먼저 세운 상태입니다.

- `app/(auth)`: 로그인 흐름
- `app/(tabs)`: map, community, me 등 앱 엔트리
- 웹 API 계약을 그대로 재사용하도록 설계합니다.

### `package-shared`

이 프로젝트의 핵심 패키지입니다.

역할:

- 웹과 앱이 함께 쓰는 타입 정의
- API 경로 상수
- 인증/세션/커뮤니티/알림/경로/장소 서비스내 엔티티 모델
- 공통 문서의 기준선

이 패키지가 있기 때문에:

- 웹 API 응답 shape와 앱 소비 shape를 맞출 수 있습니다.
- 한쪽에서 필드명을 바꾸면 다른 쪽도 컴파일 타임에 바로 드러납니다.
- source of truth를 코드 레벨에서 유지할 수 있습니다.

## 기술 스택

### Web

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Supabase SSR / Supabase JS
- Zod
- `@uiw/react-md-editor`
- `react-markdown`
- `rehype-sanitize`

### Mobile

- Expo 55
- Expo Router
- React Native 0.84
- TypeScript

### Backend / Infra

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime
- Supabase Bucket

## 현재 MVP 범위

현재 MVP는 아래 기능을 우선 대상으로 합니다.

| 영역       | 기능                                     | 상태    |
| ---------- | ---------------------------------------- | ------- |
| 인증       | 로그인 / 회원가입 / 로그아웃 / 세션 복구 | 구현    |
| 지도       | 장소 마커 표시                           | 구현    |
| 지도       | 경로 polyline 표시                       | 구현    |
| 장소       | place 등록/수정/삭제 관리자 기능         | 구현    |
| 경로       | 운영자 큐레이션 경로 CRUD                | 구현    |
| 커뮤니티   | 게시글 목록 / 상세 / 작성 / 수정 / 삭제  | 구현    |
| 커뮤니티   | 댓글 / 대댓글 작성, 수정, 삭제           | 구현    |
| 커뮤니티   | 좋아요 / 싫어요 반응                     | 구현    |
| 알림       | 댓글 / 대댓글 / 반응 / 시스템 알림       | 구현    |
| 알림       | Realtime 기반 DB 변경 감지               | 구현 중 |
| 좋아요     | post / route favorite                    | 구현    |
| 마이페이지 | 내가 쓴 글 / 좋아요 목록                 | 구현    |
| 관리자     | post / place / route 관리 UI             | 구현    |

## MVP 이후 범위

이 저장소에서 이미 방향을 정했지만 MVP 이후로 미룬 것들도 있습니다.

| 영역     | 기능                                  | 상태      |
| -------- | ------------------------------------- | --------- |
| 지도     | 지도 선택 모달 후 네이버/기타 앱 분기 | 예정      |
| 채팅     | 별도 WebSocket 서버 기반 실시간 채팅  | 예정      |
| 알림     | nav bell 즉시 반영 안정화             | 보완 예정 |
| 커뮤니티 | 조회수 정책 재설계                    | 보류      |
| 에디터   | markdown editor UX 추가 개선          | 보완 예정 |
| 앱       | 실시간 위치 공유                      | 검토 중   |
| 앱       | 네이티브 전용 UX 고도화               | 예정      |
| 운영     | 관리자용 공지/데이터 운영 플로우 확장 | 예정      |

## 앱 전용 기능

### 고려 중인 앱 전용 포인트

- 모바일 인증 계약
- `Authorization` + refresh token 재발급 흐름
- WebView/지도 경계 문서화
- 앱 탭 구조
- 향후 실시간 위치 공유

관련 공통 문서:

- [package-shared/docs/common/README.md](/Users/grimza/Desktop/side-project/biker-map/package-shared/docs/common/README.md)
- [package-shared/docs/common/mobile-auth-contract.md](/Users/grimza/Desktop/side-project/biker-map/package-shared/docs/common/mobile-auth-contract.md)

## Source Of Truth를 위해 한 일

이 프로젝트는 개발 착수 전에 계약 정합성을 먼저 맞추는 쪽으로 운영하고 있습니다.

### 1. `package-shared`를 기준선으로 사용

- API path를 상수화합니다.
- 인증, 세션, 커뮤니티, 경로, 알림 타입을 공통화합니다.
- 웹과 앱이 각자 임의의 shape를 만들지 않도록 제한합니다.

### 2. 웹 구현을 기준선으로 고정

현재 운영 원칙은 `web`이 source of truth 기준선이라는 점입니다.

이유:

- 현재 API route와 인증/세션 처리의 실제 동작은 웹에 있습니다.
- 모바일은 이를 소비하는 쪽이므로, 웹 변경이 앱에 영향을 주는지 추적해야 합니다.

그래서 공통 문서에도 아래 원칙을 두고 있습니다.

- 웹 구현이 사실상의 truth입니다.
- 앱 개발 기능 착수 전에 앱에 영향이 있는 변경이 있는지 `package-shared/docs/common` 문서 갱신 여부를 검토합니다.

### 3. 계약 변경은 코드와 문서 둘 다 남깁니다

다음 변경은 코드만 고치지 않고 문서 갱신 대상으로 봅니다.

- `package-shared` 타입 변경
- auth 정책 변경
- API path 변경
- notification 우선순위/형태 변경
- WebView/지도 브리지 변경

## 주요 도메인 설계 메모

### 경로

- 현재 routes 테이블의 권한은 RLS 에 의해 관리자인 경우에만 insert가 가능합니다.
- 이후 사용자가 자신의 커스텀 경로를 생성할 수 있는 기능을 검토중입니다.
- 출발지/경유지/도착지의 주소를 입력하고, Naver Map 의 geolocation으로 좌표를 불러와 DB에 기록후 이후 UI에서 polyline을 구성합니다.

### 커뮤니티

- 게시글
- 댓글
- 대댓글
- 반응 like/dislike
- 알림

구조를 각각 분리했지만, 화면에서는 engagement 단위로 묶어 재사용합니다.

### 알림

현재 알림은 다음 출처를 기준으로 운영합니다.

- 내가 쓴 글의 댓글 / 대댓글 / 반응
- 내가 쓴 댓글의 대댓글 / 반응
- 시스템 알림

source type은 `post`, `comment`, `system`으로 분리해 앱에서도 동일하게 다룰 수 있도록 맞췄습니다.

## 실시간 처리 방향

이 프로젝트는 실시간을 하나로 보지 않습니다.

### 지금

- 알림은 Supabase Realtime 기반입니다.
- DB row 변경 감지 후 클라이언트 캐시를 반영합니다.

### 이후

- 채팅은 별도 WebSocket 서버를 두는 방향입니다.

판단 근거:

- 알림/댓글/반응은 DB 변경 감지형 realtime이 맞습니다.
- 채팅은 presence, typing, room state, 저지연이 중요하므로 DB realtime과 분리하는 것이 적절합니다.

## AX 협업

이 프로젝트는 단일 구현자가 한 번에 모든 것을 처리하지 않고, 여러 역할을 분리해 병렬로 정리하는 방식을 적극 사용했습니다.

### 협업 단위

- 웹 개발
- 앱 개발
- 마케터
- 코드리뷰
- 문서화

### 실제 협업 방식

- 기능 단위로 브랜치를 잘게 나눕니다.
- 커밋도 가능한 한 역할별로 분리합니다.
- PR 생성 후 코드리뷰를 별도로 수행합니다.
- 앱 영향이 있는 변경은 공통 문서 기준으로 다시 확인합니다.
- Notion 회의록/업무일지와 저장소 변경을 함께 추적합니다.

### 이 방식으로 얻은 것

- web / mobile 계약 drift 감소
- 기능은 빠르게 붙이되 구조를 한 번 더 검증 가능
- 리뷰와 구현을 한 턴으로 묶지 않고 분리 가능

## 현재 개발 중인 것

이 README 작성 시점 기준, 아래 성격의 작업이 이어지고 있습니다.

- 알림 realtime 반영 안정화
- 앱 인증 계약 정리
- 지도/경로/좋아요 흐름의 웹-앱 정합성 보강

## 실행 방법

### 루트

```bash
npm run dev:web
npm run build:web
npm run dev:mobile
```

### 웹만 실행

```bash
cd web
npm run dev
```

### 모바일만 실행

```bash
cd mobile
npm run dev
```

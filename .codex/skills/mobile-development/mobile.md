# Mobile Development Guide

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 Biker Map 모바일 앱 개발 시의 구현 기준을 정리합니다.

## 앱의 위치

모바일 앱 코드는 `mobile` 디렉터리를 기준으로 합니다.
모바일 공통 전제는 `.codex/skills/mobile-development/SKILL.md`를 따릅니다.

- Expo 기반 앱입니다.
- Expo Router를 사용합니다.
- 공통 타입과 상수는 `package-shared`를 기준으로 맞춥니다.
- 현재 API와 인증 흐름의 source of truth는 `web`입니다.

## 폴더 구조

현재 모바일 앱은 아래 구조를 기준으로 봅니다.

- `mobile/app`: Expo Router route
- `mobile/app/(auth)`: 인증 화면
- `mobile/app/(tabs)`: 탭 기반 앱 화면
- `mobile/features`: 기능 단위 로직
- `mobile/components`: 앱 공통 UI와 shell
- `mobile/assets`: 이미지와 폰트 리소스

새 기능을 만들 때는 웹의 FSD 구조를 그대로 복사하기보다, Expo Router와 앱 화면 단위에 맞춰 단순하게 시작합니다.

## 인증 흐름

모바일 인증 계약은 `package-shared/docs/common/mobile-auth-contract.md`를 기준으로 합니다.

401 처리 흐름:

1. API 요청이 401을 반환합니다.
2. 앱은 refresh token으로 `/api/auth/refresh`를 호출합니다.
3. refresh 성공 시 access token과 refresh token을 모두 교체 저장합니다.
4. 원 요청을 1회 재시도합니다.
5. refresh 실패 시 로컬 세션을 제거하고 로그인 화면으로 이동합니다.

## API Client 기준

앱 API client는 BFF API를 호출합니다.

- 인증이 필요한 요청에는 access token header를 붙입니다.
- 401 retry는 client 공통 계층에서 처리합니다.
- 화면 컴포넌트 내부에서 fetch 로직을 직접 길게 작성하지 않습니다.

## 상태 관리

서버 상태는 앱에서도 TanStack Query 사용을 우선 검토합니다.

- API 응답 데이터는 query hook으로 분리합니다.
- mutation 성공/실패 후 cache invalidation 기준을 명확히 합니다.
- reaction/favorite처럼 즉시 반응성이 중요한 기능은 optimistic update를 검토합니다.

로컬 UI 상태는 화면 내부 state로 유지합니다.

- tab 선택
- dialog/sheet open 여부
- 임시 input state
- 화면 전용 loading state

## 앱 전용 기능

앱 전용 기능은 웹 기능과 같은 contract를 공유할 수 있는지 먼저 봅니다.

검토 중인 앱 전용 기능:

- 실시간 위치 공유
- 모바일 지도 UX
- push notification
- 네이티브 권한 요청
- 앱 전용 nearby 경험

실시간 위치 공유나 채팅처럼 지속 연결이 필요한 기능은 Supabase Realtime만으로 밀어붙이지 않고, 별도 WebSocket 서버나 위치 SDK 도입 가능성을 검토합니다.

## UI / Navigation

- Expo Router route 구조를 우선합니다.
- 탭 화면은 `mobile/app/(tabs)`를 기준으로 합니다.
- 인증 화면은 `mobile/app/(auth)`를 기준으로 합니다.
- 공통 shell은 `mobile/components`에서 관리합니다.
- 웹 UI를 그대로 복사하지 말고 모바일 터치 타깃, safe area, native navigation 흐름을 고려합니다.
- map 화면은 웹뷰로 구현되고, 그외에는 모바일 전용 screen을 사용합니다.

## 금지 패턴

- 모바일 앱에서 Supabase service role key 사용
- 웹 cookie refresh 흐름에 모바일을 억지로 맞추기
- 앱 전용 response shape를 웹과 별도로 임의 생성
- `package-shared`에 이미 있는 타입과 상수를 앱 내부에 중복 정의
- 화면 컴포넌트 안에 API 호출과 token refresh 로직을 직접 구현
- native permission이 필요한 기능을 permission 설계 없이 구현

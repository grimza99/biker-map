# [2026-06-25] 웹 form 클라이언트 validation 변경 로그

<strong>문서 버전 : </strong> v1

## 1. 변경 요약
- 웹 form이 `react-hook-form` + `zodResolver` 기반으로 재구성되었다.
- validation 실패 시 submit 단계에서 mutation, server action, BFF 요청이 나가지 않도록 변경되었다.
- 일부 auth 공통 schema는 `package-shared`에 추가되었고, 웹 auth form은 해당 schema/패턴을 기준으로 정리되었다.

## 2. 변경 범위
- 화면:
  - 웹 로그인 / 회원가입
  - 웹 SMS 인증 다이얼로그
  - 웹 커뮤니티 게시글 작성 / 댓글 작성
  - 웹 관리자 장소 작성 / 수정
  - 웹 마이페이지 프로필 수정
  - 웹 경로 작성 / 수정
- API:
  - API path 변경 없음
  - BFF validation 유지
- package-shared:
  - `src/schemas/auth.ts`
  - `src/schemas/index.ts`
  - `src/index.ts` export 확장
- auth:
  - 웹 로그인 / 회원가입 / SMS 인증 입력 검증이 클라이언트 선검증으로 변경
- map/WebView:
  - 영향 없음
- notification:
  - 영향 없음

## 3. 변경 이유
- 잘못된 입력이 서버로 전달되기 전에 클라이언트에서 차단해 UX와 불필요한 요청 비용을 줄이기 위해 변경했다.
- 웹을 source of truth로 두고, 이후 모바일에서도 같은 검증 계약을 재사용할 수 있도록 schema 정리 방향을 맞추기 위해 변경했다.

## 4. 앱 영향도
- 분류: UI 영향 / contract 영향
- 영향 설명:
  - API path와 응답 contract 자체는 바뀌지 않았지만, 입력 검증 기준이 웹에서 선명해졌다.
  - auth 기본 schema가 `package-shared`에 추가되어 모바일도 같은 검증 규칙을 재사용할 수 있는 기준이 생겼다.
  - 단, 모바일은 현재 runtime 의존성 해석 구조상 `package-shared` schema만 추가해도 `mobile`에도 `zod`가 필요하다.

## 5. 앱 대응 필요 여부
- 필요
- 필요한 경우 해야 할 일:
  - 모바일 auth form에 `package-shared` auth schema를 적용할지 검토
  - 모바일에 `react-hook-form`, `@hookform/resolvers`, `zod`를 둘지 결정
  - 웹과 동일한 에러 메시지/최소 길이/trim 규칙을 맞출지 검토
  - route/place/profile/community form은 shared 후보와 mobile 전용 schema를 분리해서 후속 설계

## 6. 변경된 source of truth
- 파일 경로:
  - `web/features/auth/ui/auth-form-panel.tsx`
  - `web/features/auth/ui/AuthVerifyDialog.tsx`
  - `web/features/auth/model/auth-verify-schemas.ts`
  - `web/features/community/ui/community-post-form.tsx`
  - `web/features/community/ui/CommentForm.tsx`
  - `web/features/community/model/community-form-schemas.ts`
  - `web/features/admin/place/ui/PlaceForm.tsx`
  - `web/features/admin/place/model/place-form-schemas.ts`
  - `web/features/me/ui/ProfileForm.tsx`
  - `web/features/me/model/profile-form-schemas.ts`
  - `web/features/routes/ui/route-form.tsx`
  - `web/features/routes/model/route-form-schemas.ts`
  - `package-shared/src/schemas/auth.ts`
  - `package-shared/src/schemas/index.ts`
  - `package-shared/src/index.ts`
- 관련 문서:
  - `package-shared/docs/common/web-app-change-log-template.md`
  - `.codex/skills/frontend-development/SKILL.md`
  - `.codex/skills/frontend-development/zod.md`
- PR / 커밋:
  - 미발행

## 7. 확인 포인트
- 앱에서 재검토할 화면:
  - 모바일 로그인 / 회원가입
  - 모바일 프로필 수정
  - 모바일 커뮤니티 글쓰기 / 댓글쓰기
- 앱에서 재검토할 API:
  - `auth login/signup/verify`
  - `me update`
  - `posts/comments`
- QA 포인트:
  - invalid input일 때 요청이 실제로 차단되는지
  - 에러 메시지가 웹 기준과 동일한지
  - trim, 최소 길이, URL, 숫자 변환 규칙이 웹과 일치하는지
  - shared schema import 시 mobile runtime dependency가 충족되는지

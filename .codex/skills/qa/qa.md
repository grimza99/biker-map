# QA / 검증 가이드

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 로컬 실행, 브라우저 확인, 회귀 테스트, 수동 QA 시 참고합니다.

현재 테스트관련 파일과 관련 문서는 존재하지 않지만, mvp 개발 이후 사용자가 테스트 관련 파일 작성과 master plan, test plan 관련 작업, 테스트파일 작성을 요청할 예정입니다.
사용자와 qa 관련 질의가 오고감에 따라 당신은 이 toml 파일과 관련 문서를 생성, 수정해야 합니다.

## 기본 검증 순서

1. 변경된 파일과 영향 범위를 확인합니다.
2. 타입체크, lint, 테스트 중 가능한 명령을 실행합니다.
3. 프론트엔드 변경이면 관련 페이지를 브라우저에서 확인합니다.
4. 인증/권한 변경이면 로그인/비로그인/admin/owner 케이스를 나눠 봅니다.
5. Supabase 변경이면 RLS와 실제 API 응답을 같이 확인합니다.

## 주요 QA 시나리오

- 로그인 후 새로고침 시 세션 유지
- post/comment/reply 작성, 수정, 삭제
- reaction optimistic update와 실패 롤백
- favorite optimistic update
- 알림 nav dot, border, dropdown, 전체 알림 페이지
- map page marker, route polyline, category filter
- route detail map polyline 표시
- admin 이미지 업로드와 markdown 삽입
- my page profile update와 account delete

# Common Docs Hub

이 디렉토리는 웹과 앱이 함께 참조해야 하는 공통 문서 허브다.

## 목적

- 웹 개발을 기준선으로 삼되, 앱 개발이 중간에 방향을 잃지 않게 한다.
- `package-shared` 계약, 인증 정책, WebView 경계, 변경 로그를 한곳에서 추적한다.
- 웹 변경이 앱에 영향을 줄 때 무엇을 확인해야 하는지 빠르게 찾게 한다.

## 운영 원칙

1. 웹 구현이 사실상의 진실의 원천이다.
2. 단, 웹 변경이 앱에 영향을 주는 경우 이 디렉토리 문서를 함께 갱신한다.
3. `package-shared`, `web/app/api`, auth 정책, map WebView 경계, notification 우선순위 변경은 반드시 문서 대상이다.
4. 문서가 바뀌면 앱 팀은 이를 기준으로 `무영향`, `UI 영향`, `contract 영향`, `auth 영향`, `WebView 영향`을 다시 판정한다.

## 현재 문서

- `mobile-auth-contract.md`
  - 모바일 앱이 웹 API proxy를 통해 인증할 때의 요청/응답 규칙
- `web-app-change-log-template.md`
  - 웹 변경을 앱 팀에 전달할 때 사용하는 기록 템플릿

## 갱신 트리거

다음 중 하나가 바뀌면 이 디렉토리 문서 갱신 여부를 검토한다.

- `package-shared/src/constants/api.ts`
- `package-shared/src/types/auth.ts`
- `web/app/api/auth/*`
- `web/shared/api/auth.ts`
- 지도 WebView 경계 또는 bridge event
- notification 흐름과 우선순위


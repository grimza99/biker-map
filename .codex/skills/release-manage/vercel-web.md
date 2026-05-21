# Vercel Web Release Guide

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 Biker Map 웹의 Vercel 기반 릴리즈를 점검할 때 사용합니다.

## 역할

현재 Biker Map 웹은 Vercel 배포 흐름을 기준으로 합니다.

release-manager의 현재 주 역할은 배포 명령을 직접 실행하는 것이 아니라, `dev -> main` 릴리즈 PR이 안전한지 판단할 수 있도록 diff와 운영 리스크를 정리하는 것입니다.

## dev -> main 릴리즈 PR 점검

릴리즈 PR에서는 개별 기능 PR보다 넓은 관점으로 봅니다.

확인 항목:

- dev와 main 사이 diff 규모
- 포함된 기능 목록
- DB migration 포함 여부
- env 변경 포함 여부
- `package-shared` contract 변경 여부
- mobile 앱 영향 여부
- auth/session/token 변경 여부
- RLS/service role 변경 여부
- 외부 API 비용성 변경 여부
- Sentry나 logging 변경 여부

릴리즈 PR이 너무 크면 기능 단위로 risk를 나눠 설명합니다.

## 릴리즈 가능 여부 판단

결과는 아래 형식으로 정리합니다.

- Release recommendation: 배포 가능 / 조건부 가능 / 보류 권장
- Blocking risk: main merge 전 반드시 해결할 항목
- Non-blocking follow-up: 배포 후 처리 가능한 항목
- Migration checklist: Supabase SQL 적용 여부와 순서
- Env checklist: Vercel env 또는 server env 변경 필요 여부
- QA checklist: 배포 전/후 확인할 화면과 API
- Monitoring checklist: Sentry, logs, error spike 확인

## Vercel 배포 기준

확인 항목:

- Vercel env가 dev/prod에 맞게 설정되어 있는지
- Supabase URL/key가 올바른 환경을 가리키는지
- Naver API key와 허용 도메인이 배포 도메인과 맞는지
- build-time env와 runtime env 차이를 이해했는지
- 배포 후 `/`, `/map`, `/routes`, `/posts`, `/me` smoke test가 가능한지

Vercel 자체 배포는 자동화되어 있더라도, DB migration과 env 변경은 별도 순서로 관리해야 합니다.

## Supabase Migration 체크

DB 변경이 포함된 릴리즈는 `db-auditor` 기준을 함께 적용합니다.

확인 항목:

- migration이 main 배포 전에 적용되어야 하는지
- migration이 backward compatible한지
- RLS 변경이 기존 API를 깨뜨리지 않는지
- destructive SQL이 포함되어 있는지
- function/trigger 권한과 `search_path`가 안전한지
- Storage bucket 정책 변경이 필요한지

DB migration이 코드보다 먼저 필요한지, 코드 배포 후 적용해도 되는지 순서를 명시합니다.

## Sentry / Observability

Sentry는 release-manager가 운영 관점에서 담당하고, 구현은 frontend/BFF 담당 agent가 처리합니다.

확인 항목:

- Sentry DSN이 환경별로 설정되어 있는지
- production/staging environment tag가 분리되어 있는지
- release version이 배포와 연결되는지
- source map 업로드가 필요한지
- client/server error가 모두 수집되는지
- user id, request id, endpoint tag 같은 context가 필요한지
- token, refresh token, service role key, 개인정보가 event에 포함되지 않는지
- 배포 후 error spike를 확인할 기준이 있는지

Sentry를 아직 설치하지 않은 경우에는 설치 자체보다 먼저 수집 범위와 민감정보 masking 기준을 정합니다.

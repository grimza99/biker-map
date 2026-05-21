# Release Automation Guide

<strong>버전 : </strong> v1.1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 릴리즈 점검 자동화와 주기적 권고 기준을 정리합니다.

## 기본 원칙

subagent 자체는 스케줄러처럼 백그라운드에서 계속 실행되지 않습니다.

가능한 방식:

- 사용자가 `release-manager로 릴리즈 상태 점검해줘`라고 요청하면 현재 diff 기준으로 권고안을 냅니다.
- 별도 automation이 있다면 주기적으로 `main..dev` 누적 diff와 열린 `release/*` PR 상태를 함께 확인하고 릴리즈 권고 리포트를 만들 수 있습니다.
- GitHub Actions, cron, Codex automation 중 하나로 별도 스케줄러를 구성할 수 있습니다.

## 권장 점검 시간

- 매일 오전 10시 KST

오전 10시를 기본값으로 두는 이유:

- 전날 merge된 PR과 야간 배포/자동화 결과를 확인할 수 있습니다.
- 당일 작업 시작 전에 릴리즈 PR이 너무 커졌는지 판단할 수 있습니다.
- 문제가 있으면 같은 날 오전에 dev 정리, QA, migration 확인을 진행할 수 있습니다.

## 정기 점검 항목

- 현재 열린 PR 수
- PR 중 release-blocking 가능성이 있는 항목
- 열린 `release/*` PR 수와 상태
- `main..dev` diff 규모
- dev에 포함된 기능 목록
- Supabase migration 포함 여부
- env 변경 포함 여부
- auth/session/RLS/service role 변경 포함 여부
- mobile API contract 영향 여부
- 다음 release branch를 지금 만들지, 더 쪼갤지, 보류할지

## 자동 판단 기준

다음 중 하나 이상이면 릴리즈 검토를 권고합니다.

- dev와 main 차이가 1주 이상 누적됨
- 열린 PR이 5개 이상임
- 단일 release branch에 독립 기능이 5개 이상 포함됨
- DB migration 또는 env 변경이 포함됨
- auth/session/RLS/service role 변경이 포함됨
- 배포 후 smoke test 범위가 커짐

## release branch 운영 규칙

- 배포 후보는 항상 `main`에서 `release/YYYY-MM-DD` 또는 `release/<scope>-<date>` 형식으로 분기합니다.
- `dev` 전체를 merge 하지 않고, 이번 배포 범위에 포함할 커밋만 `cherry-pick`합니다.
- release branch에서 hotfix가 발생하면 `main` merge 뒤 `dev`에도 반드시 다시 반영합니다.
- automation 리포트는 "지금 release branch를 새로 만들지", "기존 release branch에 커밋을 더 얹을지", "이번 배포를 보류할지"까지 권고합니다.

## 권고안 형식

```text
Release check 기준 시각: YYYY-MM-DD 10:00 KST
Open PRs: N개
Open release PRs: N개
main..dev diff: 커밋 N개, 파일 N개 변경
주요 포함 범위: ...
Blocking risk: ...
Recommendation: 지금 release branch 생성 / 기능별 분리 후 생성 / 보류
```

## 금지 사항

- subagent가 사용자 확인 없이 main 배포를 결정했다고 가정하기
- 자동화 결과만 보고 migration/env 확인 생략
- diff가 큰데 기능별 risk를 나누지 않기
- `dev -> main` 전체 merge를 기본 전략처럼 설명하기

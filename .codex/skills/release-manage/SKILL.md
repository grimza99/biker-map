---
name: biker-map-release-manage
description: Use when reviewing Biker Map web and mobile releases, dev to main release PRs, Vercel deployment risk, app release readiness, Sentry, automation, and infrastructure cost.
metadata:
  short-description: Release management guidance
---

# Release Manage Skill

<strong>버전 : </strong> v1.1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

Biker Map의 웹/앱 릴리즈, 배포 리스크, 운영 모니터링, 비용 관점을 점검할 때 사용합니다.

## 사용 시점

다음 작업을 할 때 사용합니다.

- `main -> release/* -> main` 릴리즈 PR 점검
- Vercel 웹 배포 전후 체크
- 앱 배포 준비와 스토어 제출 리스크 점검
- Sentry 또는 운영 모니터링 설정 검토
- 매일 릴리즈 가능성 점검 automation 기준 정리
- AWS 등 인프라 이전, 비용 예산, 절감 방향 검토

## 먼저 읽을 문서

- Vercel 웹 릴리즈: `.codex/skills/release-manage/vercel-web.md`
- 앱 배포: `.codex/skills/release-manage/app-release.md`
- 릴리즈 automation: `.codex/skills/release-manage/automation.md`
- 인프라 이전/비용: `.codex/skills/release-manage/infra-migration.md`

## 함께 참고할 문서

- BFF 기준: `.codex/skills/bff-development/bff.md`
- DB 기준: `.codex/skills/db-engineering/database-design-guide.md`
- DB/보안 감사 기준: `.codex/skills/db-engineering/db-auditor.md`
- 앱 기준: `.codex/skills/mobile-development/mobile.md`
- Supabase client 기준: `.codex/skills/frontend-development/supabase-client.md`

## 핵심 원칙

- release-manager는 자동으로 main 배포를 결정하지 않습니다.
- 릴리즈 타이밍은 사용자에게 권고안으로 제시합니다.
- `dev`는 통합 브랜치로 보고, 배포는 `main`에서 만든 `release/*` 브랜치에 필요한 커밋만 `cherry-pick`하는 방식을 기본으로 합니다.
- release branch에는 이번 배포 범위에 포함된 기능, migration, env 변경만 선별 반영합니다.
- release slice가 불명확하면 먼저 제외 범위를 정리하고, draft/실험 기능은 배포 대상에서 뺍니다.
- Vercel 배포 성공만으로 릴리즈 완료로 보지 않고, DB migration, env, smoke test, Sentry/error monitoring을 함께 확인합니다.
- 앱 배포는 rollback이 어렵기 때문에 웹 BFF API와의 backward compatibility를 우선합니다.
- 비용성 변경은 사용량 제한, 캐시, DB 저장, 배포 후 모니터링 기준을 함께 검토합니다.

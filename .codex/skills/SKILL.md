---
name: biker-map
description: Use when working in the Biker Map repository, including web, mobile, package-shared, Supabase, design, QA, code review, PR, and Notion documentation tasks.
metadata:
  short-description: Biker Map repo guidance
---

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

# Biker Map 레포 전용 Skill

이 skill은 Biker Map 레포에서 작업할 때 프로젝트별 문서를 먼저 참조하도록 안내합니다. 세부 규칙은 이 파일에 모두 넣지 않고, 목적별 문서와 subagent 설정으로 분리합니다.

## 메인 에이전트 운영 방식

이 레포에서 메인 에이전트는 PM, Tech Lead, Agent Hub 역할을 우선합니다.

- 요청을 받으면 먼저 제품 범위, 기술 범위, 필요한 subagent를 판단합니다.
- MVP, MVP 이후, 보류 사항을 구분해 작업 범위를 조정합니다.
- subagent는 전문 검토, 병렬 조사, 리뷰, QA, 릴리즈 점검에 사용합니다.
- 최종 응답과 의사결정은 메인 에이전트가 통합해서 제공합니다.
- source of truth는 현재 `web`이며, 앱 영향이 있는 변경은 `package-shared`와 모바일 계약을 함께 확인합니다.
- 구현 요청이 명확하면 계획 설명에 머무르지 않고 필요한 변경, 검증, 정리까지 진행합니다.
- 커밋, PR, 배포, Notion 문서화는 사용자의 명시 요청이 있을 때 수행합니다.

## 사용 시점

다음 작업을 할 때 사용합니다.

- `web` 기능 구현 또는 버그 수정
- `mobile` 앱 작업
- `package-shared` 계약 변경
- Supabase, RLS, migration, Storage, Realtime 작업과 감사
- PR 생성, 코드리뷰, QA , 배포
- Notion 문서화
- 디자인 산출물을 위한 디자인 시스템을 기준 프롬프트 생성 작업 (리버스 프롬프트)

## Skill 진입점

- 전체 프로젝트 개요와 공통 규칙: `AGENTS.md`
- 앱 개발 skill: `.codex/skills/mobile-development/SKILL.md`
- BFF 개발 skill: `.codex/skills/bff-development/SKILL.md`
- DB engineering skill: `.codex/skills/db-engineering/SKILL.md`
- 프론트엔드 개발 skill: `.codex/skills/frontend-development/SKILL.md`
- 릴리즈 관리 skill: `.codex/skills/release-manage/SKILL.md`

위 폴더의 `SKILL.md`는 해당 영역의 공통 전제와 세부 문서 역할을 정의합니다. 세부 `.md` 파일에는 구현 기준, 점검 기준, 실행 절차처럼 역할별 내용만 둡니다.

## Subagent 참고 문서

아래 문서는 현재 독립 skill이 아니라 subagent가 직접 읽는 역할별 참고 문서입니다.

- 디자인 / UI 작업 문서: `.codex/skills/design/design.md`
- Notion 문서화 문서: `.codex/skills/docs/notion.md`
- 코드리뷰 문서: `.codex/skills/code-review/code-review.md`
- QA / 검증 문서: `.codex/skills/qa/qa.md`

## Subagent

`.codex/agents/*.toml`은 Codex가 로드할 수 있는 프로젝트 로컬 subagent 정의입니다.

- 코드리뷰: `.codex/agents/code-reviewer.toml`
- DB 점검: `.codex/agents/db-auditor.toml`
- 앱 개발: `.codex/agents/mobile-developer.toml`
- BFF 개발: `.codex/agents/bff-developer.toml`
- 프론트엔드 개발: `.codex/agents/frontend-developer.toml`
- Notion 문서화: `.codex/agents/notion-writer.toml`
- QA 검증: `.codex/agents/qa-runner.toml`
- 릴리즈 관리: `.codex/agents/release-manager.toml`
- 디자인 브리프 작성: `.codex/agents/design-brief-writer.toml`

# Biker Map 에이전트 가이드

이 문서는 `biker-map` 레포에서 작업하는 에이전트의 공통 규칙, 세부 절차,
역할별 참고 문서, 상세 내용 문서 진입점을 정의한다.

<strong>버전 : </strong> v1.2

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-22

## 프로젝트 개요

Biker Map은 바이커를 위한 장소 탐색, 큐레이션 경로, 커뮤니티, 알림, 모바일 앱 연동을 함께 다루는 모노레포입니다.

- `web`: Next.js 16 App Router 기반 웹 앱과 API route
- `mobile`: Expo Router 기반 모바일 앱
- `package-shared`: 웹/앱 공통 타입, 상수, API 계약, 문서 허브
- `supabase`: Supabase migration, baseline, legacy SQL 기록
- `design`: 디자인 시스템과 화면 설계 문서

## 기술 스택

- Web: Next.js 16, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Zod
- Mobile: Expo, Expo Router, React Native, TypeScript
- Backend: Supabase Auth, Postgres, Storage, Realtime
- Shared: `package-shared` 기반 공통 타입, 상수, 계약 관리

## Source Of Truth

현재 구현 기준은 `web`입니다.

- 실제 API route, 인증, 세션, Supabase 연동은 `web` 기준으로 먼저 동작합니다.
- 앱은 웹 API 계약을 소비하므로, 앱에 영향이 있는 변경은 `package-shared`와 공통 문서를 함께 확인합니다.
- 인증, 알림, API path, WebView/지도 경계가 바뀌면 `package-shared/docs/common` 갱신 여부를 검토합니다.

## 메인 에이전트 역할

메인 에이전트는 Biker Map 작업의 PM, Tech Lead, Agent Hub 역할을 함께 수행합니다.

- 사용자 요청을 먼저 제품 범위와 기술 범위로 나눠 해석합니다.
- 기능이 MVP, MVP 이후, 보류 중 어디에 해당하는지 판단합니다.
- 필요한 경우에만 subagent를 명시적으로 호출합니다.
- 긴급하거나 blocking인 작업은 subagent에 넘기지 않고 직접 처리합니다.
- 병렬 검토가 유리한 작업은 app, bff, frontend, db-auditor, qa, code-reviewer, release-manager 등으로 역할을 나눕니다.
- subagent 결과를 그대로 전달하지 않고, 메인 에이전트가 최종 의사결정과 통합 판단을 제공합니다.
- 구현 중에는 source of truth, package-shared 영향, 웹/앱 호환성, 릴리즈 리스크를 함께 봅니다.
- 사용자가 명시적으로 커밋/PR/배포를 요청하기 전까지 임의로 publish 단계로 넘어가지 않습니다.

메인 에이전트는 단순 작업 실행자가 아니라, 요구사항 정리, 범위 조정, 구현 조율, 검증 계획, 후속 리스크 정리를 담당합니다.

## 워크트리 운영 규칙

웹 개발이 프로덕션 서비스 출시 단계에 충분히 가까워질 때까지 `frontend-developer`는 메인 워크트리에서 작업합니다.

- `frontend-developer`: 메인 워크트리에서 직접 작업합니다.
- 그 외 모든 subagent: 별도 git worktree에서 작업합니다.
- 별도 worktree에서 만든 변경은 검토 후 메인 작업 흐름에 merge 합니다.
- merge가 완료된 별도 worktree는 즉시 삭제합니다.
- 메인 에이전트는 subagent를 호출하기 전에 해당 작업이 메인 워크트리 작업인지, 별도 worktree 작업인지 명확히 구분합니다.

## 브랜치 / 배포 전략

현재 Biker Map은 `dev -> main` 전체 merge 방식 대신 release branch 기반 배포 전략을 사용합니다.

- `dev`: 통합 개발 브랜치입니다. 여러 기능 PR이 계속 합쳐질 수 있으며, 항상 바로 배포 가능한 상태라고 가정하지 않습니다.
- `release/*`: 배포 후보 브랜치입니다. 항상 `main`에서 분기하고, 이번 배포에 포함할 변경만 `dev`에서 `cherry-pick`합니다.
- `main`: 실제 운영 기준 브랜치입니다. 검증이 끝난 release branch만 merge 합니다.

운영 원칙:

- release branch는 `main` 기준으로 새로 만듭니다.
- `dev`의 모든 변경을 release branch에 merge 하지 않고, 배포 범위가 명확한 커밋과 PR만 선별 반영합니다.
- `migration`, `env`, `auth/session`, `RLS`, `service role`, `package-shared` contract 변경은 release slice를 나눌 때 우선적으로 별도 검토합니다.
- draft 기능, 실험 기능, 모바일 placeholder, 문서만 앞선 계약 변경은 이번 배포 대상에서 제외할 수 있습니다.
- release branch에서 발생한 hotfix는 `main` 반영 후 반드시 `dev`에도 다시 sync 합니다.

메인 에이전트와 release-manager는 release 후보를 만들 때 "무엇을 배포할지"보다 먼저 "무엇을 이번 배포에서 제외할지"를 정리해야 합니다.

## 구조 컨벤션

웹은 FSD에 가까운 구조를 유지합니다.

- `web/app`: 페이지, layout, API route
- `web/entities`: 도메인 단위 UI와 모델
- `web/features`: 사용자 액션 단위 기능
- `web/widgets`: 여러 feature/entity를 조합한 화면 블록
- `web/shared`: 공용 API helper, config, UI, hooks, provider, lib

커뮤니티의 댓글, 대댓글, 좋아요, 싫어요처럼 항상 함께 쓰이는 기능은 세부 기능을 분리하되, 화면에서는 widget에서 조합합니다.

## 현재 MVP 범위

- 인증: 로그인, 회원가입, 로그아웃, 세션 복구
- 지도: 장소 marker, 경로 polyline
- 장소: 관리자 CRUD
- 경로: 운영자 큐레이션 route CRUD
- 커뮤니티: 게시글, 댓글, 대댓글, 수정, 삭제
- 반응: post/comment 좋아요, 싫어요
- 즐겨찾기: post/route favorite
- 알림: post/comment/system 분리, Supabase Realtime 기반 수신
- 마이페이지: 내가 쓴 글, 좋아요 목록, 프로필 수정, 회원 탈퇴
- 관리자: place/route/post 관리 UI

## 보류된 결정

- 지도 앱 선택(카카오맵, t맵등) 기능은 이후 추가합니다. 현재는 네이버 지도로 이동하는 방향을 우선합니다.
- 사용자 커스텀 route 생성 기능은 geocoding비용 과다청구 우려 문제로 기능 PR은 draft, UI는 현재 개발중 카드로 막아둔 상태입니다.

## 앱 단독기능

- 위치 공유를 허락한 유저들에 한해서 서로의 위치를 공유하고, 채팅을 할수있습니다. (mvp 제외, 개발 방향 검토중)
- 채팅은 Supabase Realtime이 아니라 별도 WebSocket 서버 도입을 검토중입니다.
- 같이 라이딩하기를 요청하고, 수신한 유저가 수락하면, 각 라이더들이 만나기 좋은 중간 지점을 선정하여 제공합니다 (mvp 제외, 개발 방향 검토중)

## SKILL.md

@/.codex/skills/SKILL.md

## subagents

@/.codex/agents

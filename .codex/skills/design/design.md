# Design / UI 작업 가이드

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 랜딩페이지, 지도 UI, 관리자 UI, Figma 기반 구현, 디자인 시스템 작업 시 참고합니다.

## 기본 방향

- 기존 nav 구조는 특별한 요청이 없으면 유지합니다.
- 기존 디자인 시스템과 스타일 토큰을 먼저 확인합니다.
- 새 화면은 프로젝트의 현재 톤과 크게 어긋나지 않게 합니다.
- 불필요한 보라색/다크모드 기본값을 피하고, 화면 목적에 맞는 시각적 방향을 잡습니다.

## Figma 기반 구현

- Figma 디자인을 그대로 복사하기보다 현재 프로젝트의 nav, spacing, typography, component 패턴에 맞춥니다.
- 디자인과 현재 코드가 충돌하면 nav와 전역 layout은 현재 프로젝트 기준을 우선합니다.
- 랜딩페이지는 시각적 완성도를 높이되 기존 프로젝트의 서비스 맥락을 유지합니다.

## 디자인 브리프 / 리버스 프롬프트

- 외부 AI나 Figma/Gemini에 디자인 산출물을 요청할 때는 `design-brief-writer` subagent를 사용합니다.
- 목적은 구현이 아니라 현재 UI와 디자인 시스템을 기반으로 좋은 디자인 프롬프트를 작성하는 것입니다.
- 브리프에는 유지할 nav/layout, 디자인 토큰, 필요한 컴포넌트 상태, 반응형 요구사항, 구현 가능성 제약을 포함합니다.
- 디자인 산출물이 현재 프로젝트 톤에서 과하게 벗어나지 않도록 제한 조건을 명확히 적습니다.

## 지도 UI

- map page에서는 place marker와 route polyline의 표시 조건을 분리합니다.
- route filter가 선택되면 경로 선 중심으로 보여주는 UX를 유지합니다.
- route detail은 waypoint marker보다 route line 표시가 우선입니다.

## 에디터 / 이미지 UX

- markdown editor의 실제 cursor 위치 삽입은 신뢰도가 낮았습니다.
- 이미지 삽입은 임시 슬롯 토큰 방식이 더 안전합니다.
- 사용자가 기대하는 것은 업로드된 이미지가 route content 중간에 markdown 이미지로 들어가는 것입니다.

# 지도 사이드패널 Parallel Route 기준

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-24

<strong>최신 업데이트 날짜 : </strong> 2026-05-24

이 문서는 `web/app/(app)/(full-width)/map`의 `@panel` parallel route와 지도 사이드패널 UI 배치 기준을 정의합니다.

## 기본 Path

- 기본 목록 패널 path는 `/map/list`로 둡니다.
- 검색어, 카테고리 같은 목록 필터는 이후 `/map/list?q=...&category=...`처럼 `searchParams`로 확장합니다.
- `/map/list`는 지도 본문을 유지한 채 `@panel/list` 슬롯에 목록 패널을 표시하는 경로입니다.

## Route-Local UI 기준

`@panel` parallel route와 강하게 연결된 route-local 구조 UI는 아래에 둡니다.

- `web/app/(app)/(full-width)/map/@panel/_components`

예시는 다음과 같습니다.

- panel frame
- panel header
- panel body
- close button
- expand button
- placeholder
- parallel route slot 의존 UI

이 UI는 `@panel` 슬롯의 레이아웃, 닫힘/확장 동작, 라우트 매칭 방식에 직접 묶여 있으므로 성급하게 `widgets`나 `shared`로 올리지 않습니다.

## 도메인 UI 승격 기준

실제 장소 목록, 장소 상세, 경로 상세처럼 도메인 데이터와 여러 기능을 조합하는 UI는 재사용이 확인되면 `widgets/map`으로 올립니다.

- 장소 목록 패널 조합 UI: 재사용 확인 후 `web/widgets/map`
- 장소 상세 패널 조합 UI: 재사용 확인 후 `web/widgets/map`
- 경로 상세 패널 조합 UI: 재사용 확인 후 `web/widgets/map`

단일 도메인을 표현하는 작은 UI는 `entities/*`에 둡니다. 예를 들어 장소 카드, 경로 요약, 카테고리 배지처럼 도메인 표현 자체가 핵심인 컴포넌트가 해당합니다.

순수 범용 UI는 `shared/ui`에 둡니다. 예를 들어 특정 도메인이나 `@panel` 슬롯에 의존하지 않는 버튼, 입력, 탭, 토글, skeleton 같은 UI가 해당합니다.

## 금지 기준

- `@panel` route segment에 도메인 로직을 쌓지 않습니다.
- `@panel` page는 라우트 매칭과 route-local shell 조합에 집중합니다.
- 서버 상태 조회, mutation, cache update, optimistic update는 도메인 hook과 feature/widget 경계에서 처리합니다.
- 장소/경로/목록 도메인 로직이 커지면 `features`, `entities`, `widgets/map`으로 분리합니다.

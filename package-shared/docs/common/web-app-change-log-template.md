# Web to App Change Log Template

이 문서는 웹 개발 변경이 앱에 영향을 줄 때 남기는 표준 템플릿이다.

## 사용 시점

다음 변경이 생기면 기록한다.

- `package-shared` 타입/상수 변경
- 웹 API contract 변경
- auth 정책 변경
- map WebView 경계 변경
- notification 흐름 변경
- 앱이 따라가야 하는 UI/라우팅 구조 변경

## 기록 템플릿

```md
# [YYYY-MM-DD] 변경 로그 제목

## 1. 변경 요약
- 무엇이 바뀌었는지 3줄 이내로 요약

## 2. 변경 범위
- 화면:
- API:
- package-shared:
- auth:
- map/WebView:
- notification:

## 3. 변경 이유
- 왜 바꿨는지

## 4. 앱 영향도
- 분류: 무영향 / UI 영향 / contract 영향 / auth 영향 / WebView 영향
- 영향 설명:

## 5. 앱 대응 필요 여부
- 필요 / 불필요
- 필요한 경우 해야 할 일:

## 6. 변경된 source of truth
- 파일 경로:
- 관련 문서:
- PR / 커밋:

## 7. 확인 포인트
- 앱에서 재검토할 화면:
- 앱에서 재검토할 API:
- QA 포인트:
```

## 빠른 체크리스트

- [ ] 앱 영향도 분류를 적었는가
- [ ] `package-shared` 변경 여부를 적었는가
- [ ] auth 영향 여부를 적었는가
- [ ] map/WebView 영향 여부를 적었는가
- [ ] notification 우선순위 영향 여부를 적었는가
- [ ] 앱 팀이 바로 볼 파일/문서 경로를 적었는가

## 예시 분류 기준

### 무영향

- 웹 내부 구현만 바뀌고 앱 계약, 화면, 정책에 영향 없음

### UI 영향

- 웹 화면 구조/문구/탐색 흐름이 바뀌어서 앱이 UX 결정을 다시 해야 함

### contract 영향

- API path, request/response field, `package-shared` 타입이 바뀜

### auth 영향

- login/logout/refresh/session/me 정책이 바뀜

### WebView 영향

- map canvas, marker event, viewport, bridge payload가 바뀜

## 권장 운영 방식

1. 웹 개발자가 변경 직후 이 템플릿으로 로그를 남긴다.
2. 앱 팀이 로그를 보고 영향도를 재판정한다.
3. `contract 영향`, `auth 영향`, `WebView 영향`이 있으면 앱 작업 우선순위를 다시 본다.
4. 큰 변경이면 Notion 회의록/착수 문서도 함께 갱신한다.


# 코드리뷰 가이드

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 PR 리뷰, 자체 코드리뷰, 변경사항 점검 시 참고합니다.

## 리뷰 우선순위

1. 실제 버그와 런타임 회귀
2. 인증, 권한, RLS, service role 노출 위험
3. 데이터 정합성, optimistic update, cache invalidation 문제
4. 성능 문제와 불필요한 전체 조회
5. 테스트 누락 또는 검증 불가 지점

## 리뷰 방식

- 사용자의 요청이 있지 않은이상 리뷰 코멘트는 한글로 작성을 기본값으로 합니다.
- findings를 먼저 작성합니다.
- 심각도 높은 항목부터 정렬합니다.
- 파일과 라인을 구체적으로 적습니다.
- 확실하지 않은 내용은 질문이나 residual risk로 분리합니다.

## Biker Map에서 특히 볼 것

- API route에서 auth/session 확인이 올바른지
- owner/admin 권한 확인이 누락되지 않았는지
- Supabase query가 `select("*")` 또는 서버 메모리 필터링에 과도하게 의존하지 않는지
- Realtime 수신 후 query cache가 즉시 반영되는지
- route/map 관련 polyline lifecycle cleanup이 안전한지
- source of truth인 web에 위배되는 내용은 아닌지
- `package-shared` 계약 변경이 web/mobile 양쪽에 반영됐는지
- 이미 존재하는 상수가 아닌 문자열을 그대로 작성하지 않았는지

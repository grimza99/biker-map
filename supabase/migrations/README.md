# Supabase 마이그레이션

<strong>버전 : </strong> v2

<strong>생성 날짜 : </strong> 2026-05-14

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 프로젝트의 최초 초기 schema migration은 누락으로 인해 남아 있지 않습니다.
그래서 현재 live DB schema는 아래 위치에 별도 baseline snapshot으로 저장했습니다.

- `supabase/baseline/current/`

`supabase/migrations/legacy/pre-baseline/` 아래 파일들은 baseline snapshot을 만들기 전에 존재하던 과거 변경 기록입니다.
이 파일들은 감사와 이력 확인을 위해 보존하는 것이며, 완전한 database rebuild 경로로 보면 안 됩니다.

baseline 이후의 새 DB 변경은 이 디렉터리에 정상 Supabase migration으로 추가합니다.

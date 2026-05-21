# App Release Guide

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 Biker Map 모바일 앱 배포를 점검할 때 사용합니다.

## 역할

모바일 앱 배포가 포함되면 Expo/EAS build, 앱 버전, 스토어 제출, mobile auth contract, API 호환성까지 함께 관리합니다.

현재 비용 문제로 모바일 앱 배포 플랫폼은 Android를 우선 타겟으로 보고, 이후 예산 변경에 따라 Apple 생태계를 검토합니다.

## 앱 배포 기준

확인 항목:

- 앱 버전과 build number가 증가했는지
- Expo/EAS build profile이 올바른 환경을 가리키는지
- production API base URL이 올바른지
- mobile auth contract가 웹 BFF와 호환되는지
- `package-shared` 변경이 앱 빌드에 반영되었는지
- native permission 변경이 있는지
- Android 권한 문구와 store metadata 수정이 필요한지
- iOS 배포를 시작하는 경우 권한 문구와 App Store metadata가 준비됐는지
- push notification, deep link, universal link 설정이 필요한지
- 앱 배포 전 smoke test 범위가 정리되었는지

앱 릴리즈는 웹 배포보다 rollback이 어렵습니다. 따라서 앱이 참조하는 BFF API는 가능한 backward compatible하게 유지합니다.

## 웹/앱 호환성

웹과 앱이 같은 API contract를 공유하므로 릴리즈 전 다음을 확인합니다.

- `package-shared` 타입 변경
- `API_PATHS` 변경
- auth response shape 변경
- notification source type 변경
- route/place/post response field 변경
- 모바일 refresh token 계약 변경

앱이 이미 배포되어 있다면, 서버 API 변경은 구버전 앱과의 호환성을 고려해야 합니다.

breaking change가 필요하면 다음 중 하나를 선택합니다.

- 서버 API를 backward compatible하게 유지
- versioned endpoint 추가
- 앱 강제 업데이트 정책 검토
- 단계적 deprecation 기간 운영

## 앱 Sentry / Observability

앱 배포 시에는 mobile crash/error 수집이 필요한지 확인합니다.

확인 항목:

- mobile environment tag
- release version
- source map 또는 bundle symbolication 필요 여부
- user id, device, app version context
- token, refresh token, 개인정보 masking
- 배포 후 crash-free session 또는 error spike 확인 기준

## 앱 Smoke Test

배포 전 최소 확인 항목:

- 앱 실행과 초기 route 진입
- 로그인/회원가입
- access token 만료 후 refresh
- 탭 navigation
- 지도 화면 진입
- 커뮤니티 목록/상세 진입
- 마이페이지 세션 복원

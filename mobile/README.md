# Mobile

Expo / React Native 앱 코드는 이 폴더를 기준으로 정리한다.

- 앱 개발자는 이 폴더를 기준으로 작업한다.
- Expo Router 진입점은 `app/_layout.tsx`, `app/index.tsx`, `app/(auth)`, `app/(tabs)`에서 시작한다.
- 루트 `index`는 세션 상태에 따라 로그인 또는 탭 셸로 분기한다.
- 공통 셸은 탭 기반 placeholder 화면으로 먼저 열고, 이후 기능별 화면을 점진적으로 붙인다.
- 공통 타입과 상수는 `../package-shared`를 사용한다.

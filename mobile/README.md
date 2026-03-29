# Mobile

Expo / React Native 앱 코드는 이 폴더를 기준으로 정리한다.

- 앱 개발자는 이 폴더를 기준으로 작업한다.
- Expo Router 진입점은 `app/_layout.tsx`와 `app/(tabs)` 라우트 그룹에서 시작한다.
- 공통 셸은 탭 기반 placeholder 화면으로 먼저 열고, 이후 기능별 화면을 점진적으로 붙인다.
- 공통 타입과 상수는 `../package-shared`를 사용한다.

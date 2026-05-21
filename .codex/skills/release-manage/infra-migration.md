# Infra Migration / Cost Guide

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 Vercel 이후 AWS 등 다른 인프라로 이전하거나 비용 예산을 검토할 때 사용합니다.

## 역할

현재는 Vercel 중심이지만, 이후 AWS 등 다른 인프라를 사용할 가능성을 고려합니다.

release-manager는 인프라 변경 플랜 보고 요청이 있을 때 비용 증가 요인, 예산 추정 포인트, 절감 여지를 기록하여 보고합니다.

## 비용 관점 확인 항목

- 외부 API 호출량: Naver geocoding, directions, static/dynamic map
- Supabase 사용량: DB, Storage, Realtime, Auth
- 이미지 업로드와 Storage egress
- Realtime 구독 수와 알림/채팅 확장 가능성
- Vercel bandwidth, function execution, build 시간
- Expo/EAS build 비용 또는 store 배포 운영 비용
- AWS 이전 시 예상 비용 항목: compute, database, storage, CDN, logs, monitoring

## 비용 절감 방향

- 비용성 API는 BFF에서 호출하고 rate limit을 둡니다.
- geocoding/directions 결과는 가능한 캐시하거나 DB에 저장합니다.
- 목록 API는 DB filtering/pagination으로 불필요한 payload를 줄입니다.
- 이미지 최적화와 Storage path 정책을 정리합니다.
- Realtime은 알림과 채팅/위치 공유를 분리해 설계합니다.
- 앱 배포는 Android 우선으로 시작하고, Apple 생태계는 예산 변경 후 검토합니다.

## AWS 이전 시 검토 항목

- Next.js hosting 방식
- API route 실행 위치
- DB를 Supabase에 유지할지 이전할지
- Storage와 CDN 구조
- Sentry 또는 CloudWatch 등 observability 구조
- secrets/env 관리
- 예상 월 비용
- rollback 전략

## 금지 사항

- 비용성 외부 API 변경을 사용량 제한 없이 배포하기
- 인프라 변경 시 observability와 rollback 계획을 생략하기
- 앱/웹/API 비용을 따로 보지 않고 하나의 비용으로 뭉뚱그리기

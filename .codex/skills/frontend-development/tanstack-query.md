# TanStack Query 사용 가이드

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 Biker Map 웹 앱에서 `frontend-developer` 에이전트가 TanStack Query를 사용할 때의 현재 프로젝트 컨벤션을 정리합니다.

## 역할

TanStack Query는 서버 상태를 관리합니다.
컴포넌트 내부의 지역적인 상태는 TanStack Query 대상이 아닙니다.
프론트엔드 공통 전제는 `.codex/skills/frontend-development/SKILL.md`를 따릅니다.

- API 응답 데이터
- 로딩/에러 상태
- 캐시
- query invalidation
- optimistic update
- mutation 성공/실패 처리

## Query Hook

조회 로직은 도메인별 hook으로 분리합니다.

- `useCommunityPosts`
- `useCommunityPostDetail`
- `useComments`
- `useRoutes`
- `useRouteDetail`
- `usePlaces`
- `useMe`
- `useNotifications`

hook은 `useQuery` 결과를 그대로 return하는 방식을 기본으로 합니다.

```ts
export function useRouteDetail(routeId: string) {
  return useQuery({
    queryKey: queryKeys.route(routeId),
    queryFn: () => apiFetch<RouteDetail>(API_PATHS.routes.detail(routeId)),
    enabled: Boolean(routeId),
  });
}
```

사용하는 컴포넌트에서는 객체분해로 필요한 값을 명시적으로 꺼냅니다.

```ts
const { data, isLoading, error } = useRouteDetail(routeId);
```

## Query Key

- query key는 `package-shared/src/constants/query-keys.ts`의 `queryKeys`를 사용합니다.
- 새로운 query key 필요시, tanstack query 사용시에 인라인으로 문자열 key를 작성하기 보다는 `queryKeys`상수에 추가해서 재사용합니다.

- 목록: params 객체를 key에 포함합니다.
- 상세: entity id를 key에 포함합니다.
- root invalidate가 필요한 경우 root key를 별도로 둡니다.

예시:

```ts
queryKeys.posts(params);
queryKeys.post(postId);
queryKeys.comments(postId);
queryKeys.routes(params);
queryKeys.route(routeId);
queryKeys.notifications(params);
```

## Mutation Hook

mutation은 도메인별 hook으로 분리하고, `return useMutation(...)` 형태를 기본으로 합니다.

- `useLoginMutation`
- `useSignUpMutation`
- `useUpdateProfile`
- `useDeleteAccount`
- `useToggleReaction`
- `useToggleFavorite`
- `useCreateRoute`
- `useUpdateRoute`
- `useDeleteRoute`

컴포넌트 submit handler는 mutation 호출에만 집중하고, 성공/실패 후처리는 mutation hook 안에서 처리합니다.

```ts
const { mutateFn: login } = useLoginMutation();

login(payload);
```

## Toast 처리

toast는 가능한 mutation hook의 `onSuccess`, `onError`에서 처리합니다.

- 성공 toast: `onSuccess`
- 실패 toast: `onError`
- 메시지 상수: `package-shared/src/constants/toast.ts`의 `TOAST_MESSAGE`

컴포넌트에서 submit 직후 임의로 toast를 띄우면 mutation 성공 여부와 UI 피드백이 어긋날 수 있습니다.

```ts
return useMutation({
  mutationFn: updateProfile,
  onSuccess() {
    showToast({
      tone: "success",
      title: TOAST_MESSAGE.MY.U,
    });
  },
  onError() {
    showToast({
      tone: "danger",
      title: TOAST_MESSAGE.MY.E,
    });
  },
});
```

## Cache Update와 Invalidation

mutation 성공 후에는 관련 query를 invalidate하거나 cache를 직접 갱신합니다.

- 단순 CRUD 후 목록 재조회가 필요하면 `invalidateQueries`
- 현재 화면에서 즉시 바뀌어야 하면 `setQueryData`
- 여러 화면에 걸친 데이터라면 관련 key를 함께 invalidate

예시:

```ts
await queryClient.invalidateQueries({ queryKey: queryKeys.routes() });
await queryClient.invalidateQueries({ queryKey: queryKeys.myRoutes() });
```

프로필 수정처럼 session cache가 바로 바뀌어야 하는 경우 `setQueryData`로 먼저 반영하고, 이후 invalidate로 서버 상태를 다시 맞춥니다.

## Optimistic Update

reaction, favorite처럼 사용자 즉시 피드백이 중요한 기능은 optimistic update를 우선 검토합니다.

현재 프로젝트 패턴:

1. `onMutate`에서 관련 query를 cancel합니다.
2. 이전 cache snapshot을 context로 저장합니다.
3. `setQueryData`로 UI를 먼저 갱신합니다.
4. `onError`에서 snapshot으로 rollback합니다.
5. `onSuccess`에서 서버 응답 기준으로 cache를 확정합니다.
6. `onSettled`에서 관련 query를 invalidate합니다.

`onMutate`는 아직 서버 응답이 오기 전이므로, 응답 데이터가 필요한 처리는 `onSuccess`에서 합니다.

## Realtime과 Query Cache

Supabase Realtime으로 알림 row change를 받으면 query cache를 직접 갱신하거나 invalidate합니다.

- nav bell처럼 즉시 반영이 필요한 UI는 `setQueryData`를 우선 검토합니다.
- 전체 목록 정합성이 더 중요하면 invalidate를 병행합니다.
- Realtime 이벤트가 와도 cache 반영이 늦으면 사용자에게는 늦게 도착한 것처럼 보입니다.

## tanstack query의 기본 지침

- 모듈내에 /_------------------------------ (purpose) ---------------------------------------_/ 같은 주석을 처리하여 각각의 훅(mutation, query)를 구분합니다.
- 또한 FSD 구조에서 같은 레이어에 존재하더라도 mutation 훅과 query 훅은 다른 모듈에 구분하여 작성합니다.

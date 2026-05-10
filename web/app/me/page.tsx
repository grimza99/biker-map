"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  MyFavoritesSection,
  MyInfoSection,
  MyPostsSection,
  MyRoutesSection,
  useMe,
} from "@/entities/me";
import { useDeleteAccount } from "@features/me/model/use-delete-account";
import { useSession } from "@features/session/model/use-session";
import { ApiClientError } from "@shared/api/http";
import {
  Button,
  DefaultCardContainer,
  EmptyState,
  ErrorState,
  LoadingState,
  PageWrapper,
} from "@shared/ui";

export default function MePage() {
  const router = useRouter();
  const [tab, setTab] = useState<
    "info" | "my-posts" | "my-routes" | "favorites"
  >("info");
  const sessionState = useSession();
  const meQuery = useMe(sessionState.status === "authenticated");
  const deleteAccountMutation = useDeleteAccount();
  const me = meQuery.data?.data;

  if (sessionState.status === "loading" || meQuery.isLoading) {
    return <LoadingState label="내 정보를 불러오는 중" />;
  }

  if (sessionState.status !== "authenticated") {
    return (
      <PageWrapper className="p-6" innerClassName="gap-5">
        <EmptyState title="로그인이 필요합니다" />
      </PageWrapper>
    );
  }

  if (meQuery.isError || !me?.session) {
    return (
      <PageWrapper className="p-6" innerClassName="gap-5">
        <ErrorState title="내 정보를 불러오지 못했습니다" />
      </PageWrapper>
    );
  }

  const session = me.session;

  const getSection = (
    currentTab: "info" | "my-posts" | "my-routes" | "favorites"
  ) => {
    switch (currentTab) {
      case "info":
        return <MyInfoSection session={session} />;
      case "my-posts":
        return <MyPostsSection />;
      case "my-routes":
        return <MyRoutesSection />;
      case "favorites":
        return <MyFavoritesSection />;
    }
  };
  return (
    <PageWrapper
      className="p-6"
      innerClassName="gap-5 flex min-h-[calc(100vh-200px)]"
    >
      <DefaultCardContainer className="flex justify-center items-start">
        <div className="flex flex-col gap-5">
          <Button
            asChild
            variant="ghost"
            selected={tab === "info"}
            onClick={() => setTab("info")}
          >
            내 정보
          </Button>
          <Button
            asChild
            variant="ghost"
            selected={tab === "my-posts"}
            onClick={() => setTab("my-posts")}
          >
            내가 쓴 글
          </Button>
          <Button
            asChild
            variant="ghost"
            selected={tab === "my-routes"}
            onClick={() => setTab("my-routes")}
          >
            내 경로
          </Button>
          <Button
            asChild
            variant="ghost"
            selected={tab === "favorites"}
            onClick={() => setTab("favorites")}
          >
            내가 좋아요 한 글
          </Button>
          <Button
            variant="ghost"
            className="text-danger hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
            onClick={() => {
              const confirmed = window.confirm(
                "정말 회원 탈퇴를 진행하시겠습니까? 탈퇴 후 30일 유예가 지나면 계정과 연관 데이터가 삭제됩니다."
              );

              if (!confirmed) {
                return;
              }

              deleteAccountMutation.mutate(undefined, {
                onSuccess: () => {
                  sessionState.setSession(null, null);
                  router.push("/");
                },
                onError: (error) => {
                  window.alert(
                    error instanceof ApiClientError
                      ? error.message
                      : error instanceof Error
                      ? error.message
                      : "회원 탈퇴를 진행하지 못했습니다."
                  );
                },
              });
            }}
            loading={deleteAccountMutation.isPending}
          >
            회원 탈퇴
          </Button>
        </div>
      </DefaultCardContainer>
      <div className="flex-1">{getSection(tab)}</div>
    </PageWrapper>
  );
}

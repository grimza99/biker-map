"use client";

import Link from "next/link";
import { useState } from "react";

import { MyInfoSection, useMe } from "@/entities/me";
import { useSession } from "@features/session/model/use-session";
import {
  Button,
  DefaultCardContainer,
  EmptyState,
  ErrorState,
  LoadingState,
  PageWrapper,
} from "@shared/ui";

export default function MePage() {
  const [tab, setTab] = useState<"info" | "my-posts" | "my-routes" | "draw">(
    "info"
  );
  const sessionState = useSession();
  const meQuery = useMe(sessionState.status === "authenticated");
  const me = meQuery.data?.data;

  if (sessionState.status === "loading" || meQuery.isLoading) {
    return <LoadingState label="내 정보를 불러오는 중" />;
  }

  if (sessionState.status !== "authenticated") {
    return (
      <PageWrapper className="p-6" innerClassName="gap-5">
        <EmptyState title="로그인이 필요합니다" />
        <div className="flex justify-end">
          <Button asChild variant="primary">
            <Link href="/auth">로그인하기</Link>
          </Button>
        </div>
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

  const getSection = (tab: "info" | "my-posts" | "my-routes" | "draw") => {
    switch (tab) {
      case "info":
        return <MyInfoSection session={session} />;
      case "my-posts":
        return <div>내가 쓴 글</div>;
      case "my-routes":
        return <div>내 경로</div>;
      case "draw":
        return <div>회원 탈퇴</div>;
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
            selected={tab === "draw"}
            onClick={() => setTab("draw")}
          >
            회원 탈퇴
          </Button>
        </div>
      </DefaultCardContainer>
      <div className="flex-1">{getSection(tab)}</div>
    </PageWrapper>
  );
}

"use client";

import { CommunityPostForm } from "@features/community";
import {
  Button,
  DefaultCardContainer,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  PageWrapper,
} from "@shared/ui";
import { useState } from "react";

export default function AdminPage() {
  const [open, setOpen] = useState(false);

  return (
    <PageWrapper className="p-0 text-text" innerClassName="gap-0">
      <div className="grid gap-6 rounded-[26px] border border-border bg-panel/82 p-6 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-3">
            <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">
              Admin
            </p>
            <h1 className="m-0 text-[clamp(28px,4vw,42px)] font-semibold tracking-[var(--tracking-heading-xl)] text-text">
              커뮤니티 운영 글을 등록합니다.
            </h1>
            <p className="m-0 max-w-[68ch] text-sm leading-7 text-muted">
              운영용 작성 버튼을 통해 공지와 일반 커뮤니티 글을 등록할 수 있습니다.
              이 폼은 이후 일반 유저 글 작성 화면에서도 재사용됩니다.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">Post</Button>
            </DialogTrigger>

            <DialogContent size="lg" className="border border-border">
              <DialogHeader
                title={
                  <div className="grid gap-1">
                    <span className="text-lg font-semibold text-text">
                      커뮤니티 글 등록
                    </span>
                    <span className="text-sm font-normal text-muted">
                      운영 공지 또는 커뮤니티 글을 등록하세요.
                    </span>
                  </div>
                }
              />
              <DialogBody className="pt-0">
                <CommunityPostForm
                  allowedCategories={["notice", "question", "info", "free"]}
                  defaultCategory="notice"
                  submitLabel="글 등록"
                  onSuccess={() => setOpen(false)}
                  onCancel={() => setOpen(false)}
                />
              </DialogBody>
              <DialogFooter className="hidden" />
            </DialogContent>
          </Dialog>
        </div>

        <DefaultCardContainer className="rounded-[24px] bg-bg/48">
          <div className="grid gap-2">
            <h2 className="m-0 text-lg font-semibold text-text">운영 가이드</h2>
            <p className="m-0 text-sm leading-7 text-muted">
              공지는 `notice`, 일반 커뮤니티 글은 `question`, `info`, `free`
              카테고리로 등록합니다. 이후 이 작성 폼은 유저 글쓰기 화면에도 같은
              컴포넌트로 연결합니다.
            </p>
          </div>
        </DefaultCardContainer>
      </div>
    </PageWrapper>
  );
}

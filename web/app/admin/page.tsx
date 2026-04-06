"use client";

import { CommunityPostForm } from "@/features/community";
import {
  Button,
  DefaultCardContainer,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  PageWrapper,
} from "@shared/ui";
import { useState } from "react";

type AdminModalId = "post" | null;

export default function AdminPage() {
  const [openModalId, setOpenModalId] = useState<AdminModalId>(null);

  return (
    <PageWrapper innerClassName="grid grid-cols-3" pageTitle="Admin">
      <DefaultCardContainer>
        <h2 className="m-0 text-lg font-semibold text-text">게시글 관리</h2>
        <Dialog
          open={openModalId === "post"}
          onOpenChange={(nextOpen) =>
            setOpenModalId(nextOpen ? "post" : null)
          }
        >
          <DialogTrigger asChild>
            <Button size="lg">Post</Button>
          </DialogTrigger>

          <DialogContent size="lg" className="border border-border">
            <DialogHeader
              title={
                <span className="text-lg font-semibold text-text">
                  운영 공지 또는 커뮤니티 글 등록
                </span>
              }
            />
            <DialogBody className="pt-0">
              <CommunityPostForm
                allowedCategories={["notice", "question", "info", "free"]}
                defaultCategory="notice"
                submitLabel="글 등록"
                onSuccess={() => setOpenModalId(null)}
                onCancel={() => setOpenModalId(null)}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </DefaultCardContainer>
    </PageWrapper>
  );
}

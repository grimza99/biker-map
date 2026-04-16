"use client";

import { CommunityPostForm } from "@/features/community";
import {
  CreatePlaceDialog,
  CreateRouteDialog,
  ManagePlaceDialog,
  ManageRouteDialog,
} from "@/widgets/admin";
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

export type AdminModalId =
  | "post"
  | "place-create"
  | "place-manage"
  | "route-create"
  | "route-manage"
  | null;

export default function AdminPage() {
  const [openModalId, setOpenModalId] = useState<AdminModalId>(null);

  return (
    <PageWrapper innerClassName="grid grid-cols-3" pageTitle="Admin">
      <DefaultCardContainer>
        <h2 className="m-0 text-lg font-semibold text-text">게시글 관리</h2>
        <Dialog
          open={openModalId === "post"}
          onOpenChange={(nextOpen) => setOpenModalId(nextOpen ? "post" : null)}
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
      {/*----------------------------------------------------------- place 등록, 관리 -----------------------------------------*/}
      <DefaultCardContainer>
        <h2 className="m-0 text-lg font-semibold text-text">장소 큐레이션</h2>
        <p className="m-0 text-sm leading-7 text-muted">
          지도에 노출할 장소 등록 , 관리
        </p>
        <CreatePlaceDialog
          openModalId={openModalId}
          setOpenModalId={(modalId) => setOpenModalId(modalId)}
        />
        <ManagePlaceDialog
          openModalId={openModalId}
          setOpenModalId={(modalId) => setOpenModalId(modalId)}
        />
      </DefaultCardContainer>

      {/*----------------------------------------------------------- 경로 큐레이션 등록, 관리 -----------------------------------------*/}

      <DefaultCardContainer>
        <h2 className="m-0 text-lg font-semibold text-text">경로 큐레이션</h2>
        <p className="m-0 text-sm leading-7 text-muted">
          추천 경로 메타데이터와 외부 지도 링크 관리
        </p>
        <CreateRouteDialog
          openModalId={openModalId}
          setOpenModalId={(modalId) => setOpenModalId(modalId)}
        />
        <ManageRouteDialog
          openModalId={openModalId}
          setOpenModalId={(modalId) => setOpenModalId(modalId)}
        />
      </DefaultCardContainer>
    </PageWrapper>
  );
}

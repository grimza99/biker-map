"use client";

import type { ReactNode } from "react";

import {
  DefaultCardContainer,
  Divider,
  EmptyState,
  LoadingState,
} from "@shared/ui";

interface ManageEntityDialogLayoutProps {
  listTitle: ReactNode;
  editorTitle: ReactNode;
  editorDescription: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  listContent: ReactNode;
  listFooter?: ReactNode;
  editorContent?: ReactNode;
}

export function ManageEntityDialogLayout({
  listTitle,
  editorTitle,
  editorDescription,
  isLoading = false,
  isEmpty = false,
  emptyTitle = "등록된 항목이 없습니다.",
  listContent,
  listFooter,
  editorContent,
}: ManageEntityDialogLayoutProps) {
  return (
    <div className="flex max-h-[calc(100vh-20%)] gap-4">
      <div className="flex flex-col gap-2">
        <DefaultCardContainer className="flex min-h-[calc(100vh-25%)] flex-col gap-3 overflow-y-auto">
          <h3>{listTitle}</h3>
          {isLoading && <LoadingState label="목록을 불러오는 중" />}
          {!isLoading && isEmpty && <EmptyState title={emptyTitle} />}
          {listContent}
          {listFooter}
        </DefaultCardContainer>
      </div>

      <Divider orientation="vertical" />

      <DefaultCardContainer className="min-h-[calc(100vh-25%)] gap-4 overflow-y-auto">
        <div className="grid gap-1">
          <h3 className="m-0 text-lg font-semibold text-text">
            {editorTitle}
          </h3>
          <p className="m-0 text-sm leading-6 text-muted">
            {editorDescription}
          </p>
        </div>
        {editorContent}
      </DefaultCardContainer>
    </div>
  );
}

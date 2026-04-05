"use client";

import { DefaultCardContainer, PageWrapper } from "@shared/ui";
import { useState } from "react";

export default function AdminPage() {
  const [open, setOpen] = useState(false);

  return (
    <PageWrapper innerClassName="grid grid-cols-3" pageTitle="Admin">
      <DefaultCardContainer>
        <h2 className="m-0 text-lg font-semibold text-text">게시글 관리</h2>
      </DefaultCardContainer>
    </PageWrapper>
  );
}

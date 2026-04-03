"use client";

import { Bell } from "lucide-react";

import { Button, PageWrapper } from "@shared/ui";

export default function CommonPage() {
  return (
    <PageWrapper className="p-0 text-text" innerClassName="gap-0">
      <div className="grid gap-8 rounded-[28px] border border-border bg-panel/86 p-6 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl md:p-8">
        <section className="grid gap-3">
          <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">
            Shared UI
          </p>
          <h1 className="m-0 text-[clamp(30px,5vw,44px)] font-semibold tracking-[-0.04em] text-text">
            공통 컴포넌트 미리보기
          </h1>
        </section>

        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Buttons
          </h2>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary">primary</Button>
            <Button variant="primary" selected>
              primary selected
            </Button>
            <Button variant="primary" loading>
              primary
            </Button>

            <Button variant="secondary">secondary</Button>
            <Button variant="secondary" selected>
              secondary selected
            </Button>

            <Button variant="secondary" loading>
              secondary loading
            </Button>

            <Button variant="ghost">ghost</Button>
            <Button variant="ghost" selected>
              ghost selected
            </Button>

            <Button variant="ghost" loading>
              ghost loading
            </Button>

            <Button variant="danger">danger</Button>
            <Button variant="danger" selected>
              danger selected
            </Button>

            <Button variant="underline">underline</Button>
            <Button variant="underline" selected>
              underline selected
            </Button>

            <Button variant="secondary" size="icon" aria-label="알림">
              <Bell className="h-4 w-4 hover:text-accent" />
            </Button>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}

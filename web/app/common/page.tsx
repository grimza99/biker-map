"use client";

import { Bell, MoreHorizontal } from "lucide-react";

import { DropdownMenuItemList } from "@/shared/ui/dropdown-menu/DropdownMenu";
import { MainNav } from "@/widgets";
import {
  Button,
  Divider,
  DropdownMenu,
  DropdownMenuTrigger,
  PageWrapper,
  Profile,
  ProfileImgChip,
  Tabs,
  TabsContent,
  TabsList,
} from "@shared/ui";
import { useState } from "react";

export default function CommonPage() {
  const [showToast, setShowToast] = useState(true);

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
        <Divider />

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
        <Divider />
        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Tabs
          </h2>
          <p className="m-0 text-sm leading-7 text-muted">
            tabs의 defualtValue는 내부 상태로 관리되는 선택된 탭을 결정합니다.
            value는 외부에서 제어되는 탭을 만들 때 사용합니다(사용자가 tab 값
            변경 불가).
          </p>
          <Tabs defaultValue="map" className="gap-5">
            <TabsList
              items={[
                { value: "map", label: "지도" },
                { value: "community", label: "커뮤니티" },
              ]}
            />
            <TabsContent value="map" className="grid gap-4">
              <p className="m-0 text-sm leading-7 text-muted">지도 탭</p>
            </TabsContent>

            <TabsContent
              value="community"
              className="text-sm leading-7 text-muted"
            >
              커뮤니티 탭
            </TabsContent>
          </Tabs>
        </section>
        <Divider />

        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Main Nav
          </h2>
          <div className="rounded-3xl border border-border bg-bg/48 p-4">
            <MainNav />
          </div>
        </section>
        <Divider />

        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Profile Chip
          </h2>
          <div className="flex flex-wrap gap-3">
            <Profile name="민준" avatarUrl={null} />
            <Profile
              name="서연 라이더"
              avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
            />
            <ProfileImgChip name="민준" avatarUrl={null} />
          </div>
        </section>
        <Divider />

        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Dropdown Menu
          </h2>
          <div className="relative flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger
                label={<MoreHorizontal className="h-4 w-4" />}
              />
              <DropdownMenuItemList
                align="start"
                items={[
                  { label: "편집", value: "edit" },
                  { label: "공유", value: "share" },
                  { label: "삭제", value: "delete", tone: "danger" },
                ]}
              />
            </DropdownMenu>
          </div>
        </section>
        <Divider />
      </div>
    </PageWrapper>
  );
}

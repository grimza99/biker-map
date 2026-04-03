"use client";

import { Bell, MoreHorizontal, Search, Settings } from "lucide-react";

import { DropdownMenuItemList } from "@/shared/ui/dropdown-menu/DropdownMenu";
import { MainNav } from "@/widgets";
import {
  Button,
  ComingSoonCard,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Divider,
  DropdownMenu,
  DropdownMenuTrigger,
  Input,
  PageWrapper,
  Profile,
  ProfileImgChip,
  SelectInput,
  SidePanel,
  SidePanelBody,
  SidePanelClose,
  SidePanelContent,
  SidePanelFooter,
  SidePanelTrigger,
  Tabs,
  TabsContent,
  TabsList,
  Textarea,
  Toast,
} from "@shared/ui";

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
        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Divider
          </h2>
          <p>수평, 또는 수직 구분선</p>
          <div className="grid gap-4 rounded-[20px] border border-border bg-bg/38 p-4">
            <Divider subtle />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">왼쪽</span>
              <Divider orientation="vertical" />
              <span className="text-sm text-muted">오른쪽</span>
            </div>
          </div>
        </section>
        <Divider />

        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Dialog
          </h2>
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Settings className="h-4 w-4" />
                  설정 모달 열기
                </Button>
              </DialogTrigger>
              <DialogContent size="md">
                <DialogHeader title="title props" />
                <DialogBody>
                  <p className="m-0 text-sm leading-7 text-muted">
                    모달 내부 컨텐츠는 헤더, 본문, 푸터로 나누고 주요 액션은
                    우측 하단에 배치합니다.
                  </p>
                </DialogBody>
                <DialogFooter>
                  <DialogClose label={<span>닫기</span>} />
                  <Button variant="primary">적용</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>
        <Divider />
        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Side Panel
          </h2>
          <div className="flex flex-wrap gap-3">
            <SidePanel>
              <SidePanelTrigger asChild>
                <Button variant="secondary">오른쪽 패널 열기</Button>
              </SidePanelTrigger>
              <SidePanelContent title={<h2>title props</h2>}>
                <SidePanelBody className="grid gap-4">
                  <p>패널 예시</p>
                </SidePanelBody>
                <SidePanelFooter>
                  <SidePanelClose label="닫기" />
                  <Button variant="primary">적용</Button>
                </SidePanelFooter>
              </SidePanelContent>
            </SidePanel>
          </div>
        </section>
        <Divider />
        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Inputs
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="input"
              placeholder="라이더 이름을 입력하세요"
              helperText="프로필과 커뮤니티에서 노출됩니다."
            />
            <Input
              label="input with search type, leftIcon"
              type="search"
              leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              placeholder="라이더 이름을 입력하세요"
              helperText="프로필과 커뮤니티에서 노출됩니다."
            />

            <SelectInput
              label="select-like input"
              defaultValue="seoul-gyeonggi"
              helperText="옵션을 선택하면 드롭다운이 닫힙니다."
              options={[
                { value: "seoul-gyeonggi", label: "서울 / 경기" },
                { value: "gangwon", label: "강원" },
                { value: "chungcheong", label: "충청" },
                { value: "busan-gyeongnam", label: "부산 / 경남" },
              ]}
            />
            <Input
              label="오류 상태"
              defaultValue="잘못된 값"
              errorText="입력 형식을 다시 확인해주세요."
            />
          </div>
          <Textarea
            label="textarea"
            placeholder="자주 타는 코스나 라이딩 스타일을 적어주세요"
            helperText="최대 300자"
          />
        </section>
        <Divider />
        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Cards
          </h2>
          <ComingSoonCard
            title="즐겨찾기 기능"
            description="설명"
            footer={<Button variant="secondary">footer button</Button>}
          />
        </section>
        <Divider />
        <section className="grid gap-4">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-text">
            Toast
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Toast
              tone="success"
              title="success"
              description="description"
              action={
                <Button variant="underline" className="text-text">
                  확인
                </Button>
              }
            />
            <Toast
              tone="info"
              title="info"
              description="description"
              action={
                <Button variant="underline" className="text-text">
                  확인
                </Button>
              }
            />
            <Toast
              tone="warning"
              title="warning"
              description="description"
              action={
                <Button variant="underline" className="text-text">
                  확인
                </Button>
              }
            />
            <Toast
              tone="danger"
              title="danger"
              description="description"
              action={
                <Button variant="underline" className="text-text">
                  확인
                </Button>
              }
            />
          </div>
          )
        </section>
        <Divider />
      </div>
    </PageWrapper>
  );
}

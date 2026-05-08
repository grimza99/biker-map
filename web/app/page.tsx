import Link from "next/link";
import {
  ArrowRight,
  Compass,
  MapPinned,
  MessageSquareMore,
  Route,
} from "lucide-react";

import { Button, DefaultCardContainer } from "@shared/ui";

const featureItems = [
  {
    title: "바이커 친화 장소 탐색",
    description:
      "주차 가능 여부, 정비 포인트, 라이더가 실제로 모이는 장소를 일반 지도보다 빠르게 확인합니다.",
    icon: MapPinned,
    accentClassName: "bg-accent/12 text-accent",
  },
  {
    title: "큐레이션 드라이브 경로",
    description:
      "운영자가 정리한 라이딩 코스를 보고, 실제 외부 지도 앱으로 자연스럽게 이어서 출발할 수 있습니다.",
    icon: Route,
    accentClassName: "bg-active/14 text-active",
  },
  {
    title: "커뮤니티 기반 정보",
    description:
      "현장 후기, 주행 팁, 도로 분위기 같은 정보가 장소와 경로 선택에 바로 연결됩니다.",
    icon: MessageSquareMore,
    accentClassName: "bg-panel-soft text-text",
  },
];

const workflowItems = [
  {
    step: "1",
    title: "장소 탐색",
    description: "투어 목적지와 경로 중간 지점을 바이커 기준으로 먼저 찾습니다.",
  },
  {
    step: "2",
    title: "경로 확인",
    description: "큐레이션 경로와 주변 성지를 함께 보며 이동 흐름을 정리합니다.",
  },
  {
    step: "3",
    title: "내비 연동",
    description: "외부 지도 앱으로 넘겨 실제 주행을 바로 시작합니다.",
  },
];

const footerLinks = ["이용약관", "개인정보처리방침", "문의하기"];

function LandingButtonRow() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button size="lg" className="shadow-[0_10px_28px_rgba(229,87,47,0.28)]">
        <Link href="/map" className="inline-flex items-center gap-2">
          지도 보기
          <Compass className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="secondary" size="lg">
        <Link href="/posts">커뮤니티 보기</Link>
      </Button>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative w-full max-w-[560px]">
      <div className="absolute -left-4 -top-4 z-20 rounded-[18px] border border-border bg-panel/90 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-active/20 text-active">
            <Route className="h-4 w-4" />
          </div>
          <div className="grid gap-1">
            <small className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              경로 추천
            </small>
            <p className="text-sm font-semibold leading-5 text-text">
              [19번 국도] 초보자에게 추천하는 해안선 코스
            </p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-border bg-panel/84 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="absolute inset-x-12 top-0 h-32 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute -right-8 top-16 h-40 w-40 rounded-full bg-active/10 blur-3xl" />

        <div className="relative overflow-hidden rounded-[18px] border border-border bg-panel-solid">
          <div
            className="h-[420px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://www.figma.com/api/mcp/asset/9bb79723-380c-46cf-b1c3-e91f27ff50b4')",
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_62%)] opacity-60" />
          <div className="absolute left-[54%] top-[48%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-white bg-accent shadow-[0_0_18px_rgba(229,87,47,0.5)]" />

          <div className="absolute bottom-4 left-4 right-4">
            <DefaultCardContainer className="gap-3 rounded-[20px] border-border bg-panel/94 p-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-panel-soft" />
                <div className="grid gap-2">
                  <div>
                    <h3 className="text-[15px] font-semibold leading-6 text-text">
                      라이더 카페 · 카페 바이커맵
                    </h3>
                    <p className="text-sm leading-6 text-muted">강원 춘천시 남산면</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent">
                      주차 가능
                    </span>
                    <span className="rounded-md bg-active/12 px-2 py-1 text-[11px] font-medium text-active">
                      정비 공구
                    </span>
                  </div>
                </div>
              </div>
            </DefaultCardContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="grid gap-24 pb-14 pt-6 md:gap-28 md:pt-10">
      <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] lg:items-center">
        <div className="grid gap-6">
          <div className="grid gap-4">
            <small className="text-[11px] font-semibold uppercase tracking-[0.16em] text-active">
              Rider-first navigation
            </small>
            <h1 className="max-w-[11ch] text-[clamp(2.8rem,6vw,4.1rem)] font-bold leading-[0.98] tracking-[-0.05em] text-text">
              바이커를 위한 장소와 경로를 한 곳에서
            </h1>
            <p className="max-w-[34rem] text-base leading-8 text-muted">
              바이커만을 위한 장소 정보부터 운영자가 직접 선정한 드라이브 경로까지,
              실제 주행에 필요한 정보를 한 화면에서 빠르게 찾고 바로 이동할 수
              있습니다.
            </p>
          </div>

          <LandingButtonRow />
        </div>

        <HeroMockup />
      </section>

      <section className="grid gap-10">
        <div className="grid gap-2 text-center">
          <small className="text-[11px] font-semibold uppercase tracking-[0.16em] text-active">
            Features
          </small>
          <h2 className="text-[clamp(1.9rem,4vw,2.35rem)] font-bold tracking-[-0.04em] text-text">
            바이커를 위한 필수 기능
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featureItems.map(({ title, description, icon: Icon, accentClassName }) => (
            <DefaultCardContainer
              key={title}
              className="gap-5 rounded-[24px] border-border bg-panel/88 p-8"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${accentClassName}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="grid gap-3">
                <h3 className="text-[1.1rem] font-semibold tracking-[-0.02em] text-text">
                  {title}
                </h3>
                <p className="text-sm leading-7 text-muted">{description}</p>
              </div>
            </DefaultCardContainer>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[900px] gap-14 border-t border-border/60 pt-16">
        <div className="grid gap-2 text-center">
          <h2 className="text-[clamp(1.8rem,3.5vw,2.15rem)] font-bold tracking-[-0.04em] text-text">
            심플한 사용 과정
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start">
          {workflowItems.map((item, index) => (
            <div key={item.step} className="contents">
              <div className="grid justify-items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-panel-solid text-base font-semibold text-text">
                  {item.step}
                </div>
                <div className="grid gap-1">
                  <h3 className="text-base font-semibold text-text">{item.title}</h3>
                  <p className="max-w-[12rem] text-sm leading-6 text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
              {index < workflowItems.length - 1 ? (
                <div className="hidden self-start pt-7 md:block">
                  <div className="h-px w-12 border-t border-dashed border-border" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8">
        <DefaultCardContainer className="relative overflow-hidden rounded-[28px] border-border bg-panel/88 px-8 py-14 md:px-16">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,115,22,0.05),rgba(20,184,166,0.04))]" />
          <div className="relative grid justify-items-center gap-5 text-center">
            <div className="grid gap-3">
              <h2 className="text-[clamp(2rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.05em] text-text">
                즐거운 라이딩 생활,
                <br />
                바이커맵과 시작하세요.
              </h2>
              <p className="text-sm leading-7 text-muted">
                지금 지도를 열고 새로운 목적지와 경로를 확인해보세요.
              </p>
            </div>
            <LandingButtonRow />
          </div>
        </DefaultCardContainer>

        <footer className="grid gap-6 border-t border-border/60 px-4 pt-8 text-sm text-muted md:grid-cols-[auto_1fr_auto] md:items-center md:px-0">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/20 text-[10px] font-bold text-muted">
              A
            </div>
            <span className="font-semibold">바이커맵</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="text-center md:text-right">
            © 2024 BikerMap. All rights reserved.
          </div>
        </footer>
      </section>
    </div>
  );
}

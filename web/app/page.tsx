import Link from "next/link";

import { PageWrapper } from "@shared/ui";

export default function HomePage() {
  return (
    <PageWrapper className="p-7" innerClassName="gap-0">
      <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent)]">앱 착수</p>
      <h1 className="mt-2 max-w-[16ch] text-[clamp(30px,5vw,54px)] font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-text)]">
        바이커맵 웹 Shell과 공통 인프라를 먼저 고정한다.
      </h1>
      <p className="mt-3 max-w-[60ch] text-base leading-7 text-[color:var(--color-muted)]">
        오늘 범위는 Shell, 네비게이션, 세션 분기, TanStack Query 연결 틀이다. 실제 데이터는 뒤로 미루고
        화면 전환과 권한 흐름부터 안정화한다.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/map"
          className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text)] shadow-[0_10px_24px_var(--shadow-accent)] transition duration-150 ease-out hover:-translate-y-0.5">
          지도로 이동
        </Link>
        <Link
          href="/community"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel-solid)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text)] transition duration-150 ease-out hover:-translate-y-0.5">
          커뮤니티 보기
        </Link>
      </div>
    </PageWrapper>
  );
}

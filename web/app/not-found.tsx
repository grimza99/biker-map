import Link from "next/link";

import { PageWrapper } from "@shared/ui";

export default function NotFound() {
  return (
    <PageWrapper className="p-7" innerClassName="gap-0">
      <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--accent)]">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">페이지를 찾을 수 없습니다.</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">경로를 확인하고 홈 또는 지도 화면으로 돌아가세요.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-4 py-2.5 text-sm font-medium text-[color:var(--text)] shadow-[0_10px_24px_var(--shadow-accent)] transition duration-150 ease-out hover:-translate-y-0.5">
          홈으로
        </Link>
        <Link
          href="/map"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel-solid)] px-4 py-2.5 text-sm font-medium text-[color:var(--text)] transition duration-150 ease-out hover:-translate-y-0.5">
          지도 열기
        </Link>
      </div>
    </PageWrapper>
  );
}

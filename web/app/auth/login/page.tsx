import { PageWrapper } from "@shared/ui";

export default function LoginPage() {
  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--color-text)]">로그인</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">인증 진입점</p>
    </PageWrapper>
  );
}

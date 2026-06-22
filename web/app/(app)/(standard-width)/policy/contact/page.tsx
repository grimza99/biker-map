import Link from "next/link";

import { PATHS } from "@package-shared/constants";
import { DefaultCardContainer, PageWrapper } from "@shared/ui";

export default function ContactPage() {
  return (
    <PageWrapper
      className="mx-auto max-w-240 p-5 md:p-7"
      innerClassName="gap-8"
      pageTitle="문의하기"
    >
      <section className="grid gap-4 text-muted">
        <p>
          기존 문의하기 페이지 링크를 통해 접속한 이용자를 위해 이 경로를 계속
          제공합니다.
        </p>
        <p>
          서비스 문의는 아래 메일로 접수할 수 있으며, 정책 문서는 별도 페이지에서
          확인할 수 있습니다.
        </p>
      </section>

      <DefaultCardContainer className="gap-4">
        <div className="grid gap-2">
          <h2 className="text-text">문의 채널</h2>
          <p className="text-muted">
            계정 문제, 콘텐츠 신고, 기능 제안은 개발자 메일로 접수합니다.
          </p>
        </div>

        <div className="grid gap-2 text-sm text-muted">
          <p>이메일: gbtmxlf0808@gmail.com</p>
          <p>응답 시간: 영업일 기준 2~3일 이내</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:gbtmxlf0808@gmail.com"
            className="inline-flex h-12 items-center justify-center rounded-full border border-accent bg-accent px-5 text-base font-medium tracking-[-0.01em] text-text shadow-[var(--shadow-accent)] transition duration-150 ease-out hover:border-accent-light hover:bg-accent-light active:translate-y-px"
          >
            메일 보내기
          </a>
          <Link
            href={PATHS.policy.privacy}
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-panel-solid px-5 text-base font-medium tracking-[-0.01em] text-text transition duration-150 ease-out hover:border-accent hover:bg-panel-soft active:translate-y-px"
          >
            개인정보 처리방침 보기
          </Link>
        </div>
      </DefaultCardContainer>
    </PageWrapper>
  );
}

import { Button, DefaultCardContainer, PageWrapper } from "@shared/ui";

export default function ContactPage() {
  return (
    <PageWrapper
      className="mx-auto max-w-240 p-5 md:p-7"
      innerClassName="gap-8"
      pageTitle="문의하기"
    >
      <section className="grid gap-4 text-muted">
        <p>
          바이커맵 사용 중 오류, 제안, 운영 문의가 있다면 아래 안내에 따라
          문의를 남겨주세요.
        </p>
        <p>
          현재 개발 단계이므로 문의 채널은 단순하게 유지하고 있으며, 이후 지원
          프로세스는 별도 운영 페이지로 확장할 예정입니다.
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
          <Button asChild size="lg">
            <a href="mailto:gbtmxlf0808@gmail.com">메일 보내기</a>
          </Button>
        </div>
      </DefaultCardContainer>
    </PageWrapper>
  );
}

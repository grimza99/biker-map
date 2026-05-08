import { PageWrapper } from "@shared/ui";

export default function TermsPage() {
  return (
    <PageWrapper
      className="mx-auto max-w-240 p-5 md:p-7"
      innerClassName="gap-8"
      pageTitle="이용약관"
    >
      <section className="grid gap-4 text-muted">
        <p>
          바이커맵은 바이커를 위한 장소, 경로, 커뮤니티 정보를 제공하는
          서비스입니다. 본 약관은 서비스 이용과 관련한 기본 조건을 정의합니다.
        </p>
        <p>
          서비스 내 게시글, 댓글, 경로, 장소 정보는 운영 정책에 따라 수정 또는
          삭제될 수 있으며, 이용자는 관련 법령과 커뮤니티 운영 원칙을 준수해야
          합니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-text">1. 서비스 제공 범위</h2>
        <p className="text-muted">
          바이커맵은 장소 탐색, 경로 열람, 커뮤니티 작성 및 계정 기능을
          제공합니다. 일부 기능은 외부 지도 서비스와 연동될 수 있습니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-text">2. 이용자 책임</h2>
        <p className="text-muted">
          이용자는 본인이 작성한 콘텐츠에 대한 책임을 지며, 타인의 권리를
          침해하거나 허위 정보를 등록해서는 안 됩니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-text">3. 운영 정책</h2>
        <p className="text-muted">
          서비스 안정성과 커뮤니티 품질 유지를 위해 운영자는 콘텐츠 노출 제한,
          계정 제한, 기능 중단 등의 조치를 취할 수 있습니다.
        </p>
      </section>
    </PageWrapper>
  );
}

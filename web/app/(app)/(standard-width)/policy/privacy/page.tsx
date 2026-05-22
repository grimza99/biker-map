import { PageWrapper } from "@shared/ui";

export default function PrivacyPage() {
  return (
    <PageWrapper
      className="mx-auto max-w-240 p-5 md:p-7"
      innerClassName="gap-8"
      pageTitle="개인정보처리방침"
    >
      <section className="grid gap-4 text-muted">
        <p>
          바이커맵은 회원 식별, 서비스 제공, 계정 관리, 운영 공지를 위해 필요한
          최소 범위의 개인정보를 처리합니다.
        </p>
        <p>
          본 문서는 개발 단계 기준의 개인정보 처리 원칙을 설명하며, 실제 운영
          정책은 서비스 고도화에 따라 갱신될 수 있습니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-text">1. 수집 항목</h2>
        <p className="text-muted">
          이메일, 이름, 프로필 정보, 작성 콘텐츠, 서비스 이용 기록이 포함될 수
          있습니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-text">2. 이용 목적</h2>
        <p className="text-muted">
          계정 인증, 커뮤니티 운영, 알림 제공, 서비스 안정성 확보, 문의 대응을
          위해 사용합니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-text">3. 보관 및 삭제</h2>
        <p className="text-muted">
          회원 탈퇴 시 관련 정책에 따라 일정 기간 보관 후 삭제될 수 있으며,
          법령에 따른 보관 의무가 있는 정보는 예외적으로 유지될 수 있습니다.
        </p>
      </section>
    </PageWrapper>
  );
}

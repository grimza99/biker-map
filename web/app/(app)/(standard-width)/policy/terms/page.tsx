import { PageWrapper } from "@shared/ui";

export default function TermsPage() {
  return (
    <PageWrapper
      className="mx-auto max-w-240 p-5 md:p-7"
      innerClassName="gap-8"
      pageTitle="서비스 이용약관"
    >
      <section className="grid gap-4">
        <h2>제1조 목적</h2>
        <p className="text-muted">
          본 약관은 Biker Map이 제공하는 장소 탐색, 큐레이션 경로, 커뮤니티,
          알림 및 모바일 연동 서비스의 이용 조건과 회사와 이용자 간 권리, 의무
          및 책임사항을 정하는 것을 목적으로 합니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>제2조 서비스의 제공</h2>
        <p className="text-muted">
          Biker Map은 바이커를 위한 장소 정보, 경로 정보, 커뮤니티 게시글, 댓글,
          즐겨찾기, 알림 기능을 제공합니다.
          <br />
          정식 출시 전에는 일부 기능이 테스트 또는 제한된 형태로 제공될 수
          있으며, 기능 범위와 화면 구성은 사전 고지 없이 변경될 수 있습니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>제3조 회원가입 및 계정</h2>
        <p className="text-muted">
          이용자는 서비스가 정한 절차에 따라 계정을 생성하고 서비스를 이용할 수
          있습니다.
          <br />
          이용자는 본인의 계정 정보를 안전하게 관리해야 하며, 계정의 부정 사용이
          의심되는 경우 즉시 담당자에게 알려야 합니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>제4조 이용자의 의무</h2>
        <p className="text-muted">
          이용자는 타인의 권리를 침해하거나, 허위 정보 게시, 서비스 방해, 불법적
          목적의 이용, 비정상적인 접근을 해서는 안 됩니다.
          <br />
          커뮤니티 게시글과 댓글은 다른 이용자가 확인할 수 있으므로 개인정보,
          민감정보, 타인의 권리를 침해할 수 있는 내용을 게시하지 않아야 합니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>제5조 게시물의 관리</h2>
        <p className="text-muted">
          이용자가 작성한 게시글, 댓글, 이미지 등은 서비스 운영 목적에 따라
          노출될 수 있습니다.
          <br />
          Biker Map은 법령 위반, 권리 침해, 서비스 운영 방해, 부적절한 콘텐츠로
          판단되는 게시물을 제한, 숨김 또는 삭제할 수 있습니다.
        </p>
      </section>
      <section className="grid gap-3">
        <h2>제6조 서비스 변경 및 중단</h2>
        <p className="text-muted">
          Biker Map은 안정적인 운영을 위해 서비스의 전부 또는 일부를 변경하거나
          일시 중단할 수 있습니다.
          <br /> 정식 출시 전 테스트 기간에는 데이터 구조, 기능, 정책이 변경될
          수 있습니다.
        </p>
      </section>
      <section className="grid gap-3">
        <h2>제7조 책임의 제한</h2>
        <p className="text-muted">
          서비스 내 장소, 경로, 커뮤니티 정보는 이용자의 참고를 위한 정보이며,
          실제 이동 전 도로 상황, 영업 여부, 안전 상태를 직접 확인해야 합니다.
          <br />
          Biker Map은 이용자가 서비스를 기반으로 한 이동, 모임, 거래,
          커뮤니케이션에서 발생한 손해에 대해 법령상 책임이 인정되는 경우를
          제외하고 책임을 부담하지 않습니다.
        </p>
      </section>
      <section className="grid gap-3">
        <h2>제8조 문의</h2>
        <p className="text-muted">
          서비스 이용약관 관련 문의는 gbtmxlf0808@gmail.com로 연락해 주세요.
        </p>
      </section>
    </PageWrapper>
  );
}

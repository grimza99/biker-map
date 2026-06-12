import { PageWrapper } from "@shared/ui";

export default function PrivacyPage() {
  return (
    <PageWrapper
      className="mx-auto max-w-240 p-5 md:p-7"
      innerClassName="gap-8"
      pageTitle="개인정보 처리방침"
    >
      <section className="grid gap-4 ">
        <h2>1. 개인정보의 처리 목적</h2>
        <p className="text-muted">
          Biker Map은 회원가입, 로그인, 커뮤니티 기능 제공, 게시글 및 댓글 관리,
          즐겨찾기, 알림, 고객 문의 대응, 서비스 안정성 개선을 위해 개인정보를
          처리합니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>2. 처리하는 개인정보 항목</h2>
        <p className="text-muted">
          회원 정보: 이메일, 사용자 식별자, 닉네임, 프로필 정보 <br />
          서비스 이용 정보: 게시글, 댓글, 좋아요, 싫어요, 즐겨찾기, 알림 수신
          기록, 접속 로그, 기기 및 브라우저 정보,
          <br />
          문의 정보: 이용자가 문의 시 제공하는 이메일 주소와 문의 내용,
          <br />
          정식 출시 전에는 기능 테스트 과정에서 수집 항목이 조정될 수 있습니다.,
          <br />
        </p>
      </section>

      <section className="grid gap-3">
        <h2>3. 개인정보의 보유 및 이용 기간</h2>
        <p className="text-muted">
          Biker Map은 개인정보 처리 목적 달성 시 또는 이용자의 탈퇴 요청 시 지체
          없이 개인정보를 파기합니다. 다만 법령에 따라 보관이 필요한 정보는 해당
          법령에서 정한 기간 동안 보관할 수 있습니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>4. 개인정보의 제3자 제공</h2>
        <p className="text-muted">
          Biker Map은 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
          <br />
          다만 이용자의 동의가 있거나 법령에 따른 요청이 있는 경우에는 필요한
          범위에서 제공될 수 있습니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>5. 개인정보 처리의 위탁</h2>
        <p className="text-muted">
          서비스 운영을 위해 인증, 데이터베이스, 호스팅, 저장소, 알림 등 외부
          인프라 서비스를 사용할 수 있습니다.
          <br />
          정식 출시 전에는 구체적인 위탁 업체와 범위가 확정되는 시점에 본 방침을
          업데이트할 예정입니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>6. 이용자의 권리</h2>
        <p className="text-muted">
          Biker Map은 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
          <br />
          다만 이용자의 동의가 있거나 법령에 따른 요청이 있는 경우에는 필요한
          범위에서 제공될 수 있습니다.
        </p>
      </section>
      <section className="grid gap-3">
        <h2>7. 개인정보의 안전성 확보 조치</h2>
        <p className="text-muted">
          Biker Map은 접근 권한 관리, 인증 정보 보호, 데이터베이스 접근 제한,
          로그 점검 등 개인정보 보호를 위한 기술적·관리적 조치를 적용합니다.
        </p>
      </section>
      <section className="grid gap-3">
        <h2>8. 개인정보 보호 담당자</h2>
        <p className="text-muted">
          담당자 연락처: gbtmxlf0808@gmail.com,
          <br />
          개인정보 관련 문의, 권리 행사, 불만 처리 요청은 위 연락처로 접수해
          주세요.
        </p>
      </section>
    </PageWrapper>
  );
}

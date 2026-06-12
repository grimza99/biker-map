import { PageWrapper } from "@shared/ui";

export default function LocationPage() {
  return (
    <PageWrapper
      className="mx-auto max-w-240 p-5 md:p-7"
      innerClassName="gap-8"
      pageTitle="위치기반 서비스 이용약관"
    >
      <section className="grid gap-4">
        <h3>제1조 목적</h3>
        <p className="text-muted">
          바이커맵의 앱 전용기능인 내위치 공유와 주변 바이커 찾기 기능(이하 주변
          바이커) 은 서비스 제공을 위해 사용자의 위치 정보를 저장 하고 서비스
          제공시 사용 합니다.
        </p>
        <p className="text-muted">
          본 문서는 개발 단계 기준의 위치 정보 운영 약관을 제공하며, 실제 운영
          정책은 서비스 고도화에 따라 갱신될 수 있습니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>제2조 위치기반서비스의 내용</h2>
        <p className="text-muted">
          Biker Map은 이용자의 현재 위치와 위치를 공유하는 이용자들의 위치를
          바탕으로 주변 사용자들의 위치를 서로 공유하고, 일회성 소규모 라이딩
          모임을 즐길 수 있습니다.
        </p>
        <p className="text-muted">
          정식 출시 전에는 일부 위치 기능이 제한되거나 테스트 목적으로만 제공될
          수 있습니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>제3조 개인위치정보의 수집 및 이용</h2>
        <p className="text-muted">
          Biker Map은 이용자가 위치 권한을 허용한 경우에 한하여 위치 정보를
          사용할 수 있습니다.
          <br />
          이용자는 기기 설정 또는 앱 설정을 통해 언제든지 위치 권한을 거부하거나
          철회할 수 있습니다.
          <br />
          위치 정보는 주변 장소와 경로 표시, 지도 중심 이동, 위치 기반 추천 등
          서비스 제공 목적 범위에서 이용됩니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>제4조 개인위치정보의 보유</h2>
        <p className="text-muted">
          Biker Map은 위치기반서비스 제공에 필요한 범위에서 위치 정보를
          처리하며, 별도 저장이 필요한 기능이 도입되기 전까지 개인위치정보를
          장기간 보관하지 않는 것을 원칙으로 합니다.
          <br />
          향후 위치 공유, 라이딩 모임, 채팅 등 위치 저장이 필요한 기능이 정식
          도입되는 경우 별도 고지 및 동의 절차를 마련합니다.
        </p>
      </section>

      <section className="grid gap-3">
        <h2>제5조 제3자 제공</h2>
        <p className="text-muted">
          Biker Map은 이용자의 동의 없이 개인위치정보를 제3자에게 제공하지
          않습니다.
          <br />
          향후 위치 공유 기능이 도입되는 경우 제공 대상, 목적, 보유 기간을
          명확히 안내하고 별도 동의를 받습니다.
        </p>
      </section>
      <section className="grid gap-3">
        <h2>제6조 이용자의 권리</h2>
        <p className="text-muted">
          이용자는 개인위치정보의 수집, 이용 또는 제공에 대한 동의의 전부 또는
          일부를 철회할 수 있습니다.
          <br />
          이용자는 개인위치정보의 처리 내역에 대한 열람, 고지, 정정 또는 삭제를
          요청할 수 있습니다.
        </p>
      </section>
      <section className="grid gap-3">
        <h2>제7조 위치정보 관리 담당자</h2>
        <p className="text-muted">
          위치정보 관련 문의 및 권리 행사는 gbtmxf0808@gmail.com 으로 접수할 수
          있습니다.
        </p>
      </section>
    </PageWrapper>
  );
}

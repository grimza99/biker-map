import Link from "next/link";

export function HomeScreen() {
  return (
    <section className="page-card hero-card">
      <p className="eyebrow">앱 착수</p>
      <h1>바이커맵 웹 Shell과 공통 인프라를 먼저 고정한다.</h1>
      <p className="muted hero-copy">
        오늘 범위는 Shell, 네비게이션, 세션 분기, TanStack Query 연결 틀이다. 실제 데이터는 뒤로 미루고
        화면 전환과 권한 흐름부터 안정화한다.
      </p>
      <div className="hero-links">
        <Link href="/map" className="primary-button">
          지도로 이동
        </Link>
        <Link href="/community" className="ghost-button">
          커뮤니티 보기
        </Link>
      </div>
    </section>
  );
}

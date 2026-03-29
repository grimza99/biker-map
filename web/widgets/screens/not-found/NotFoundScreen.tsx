import Link from "next/link";

export function NotFoundScreen() {
  return (
    <section className="page-card">
      <p className="eyebrow">404</p>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p className="muted">경로를 확인하고 홈 또는 지도 화면으로 돌아가세요.</p>
      <div className="hero-links">
        <Link href="/" className="primary-button">
          홈으로
        </Link>
        <Link href="/map" className="ghost-button">
          지도 열기
        </Link>
      </div>
    </section>
  );
}

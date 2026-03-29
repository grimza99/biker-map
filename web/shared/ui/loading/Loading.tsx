export function LoadingState({ label = "불러오는 중" }: { label?: string }) {
  return (
    <div className="page-card">
      <p className="eyebrow">{label}</p>
      <h1>콘텐츠를 준비하는 중입니다.</h1>
      <p className="muted">잠시만 기다리면 다음 화면을 볼 수 있습니다.</p>
    </div>
  );
}

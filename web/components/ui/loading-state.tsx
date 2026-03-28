export function LoadingState({ label = "불러오는 중" }: { label?: string }) {
  return <div className="page-card"><p className="muted">{label}</p></div>;
}

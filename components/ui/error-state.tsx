export function ErrorState({ title = "오류가 발생했습니다", message }: { title?: string; message?: string }) {
  return (
    <div className="page-card" style={{ borderColor: "rgba(179,59,46,0.3)" }}>
      <h2 style={{ marginTop: 0, color: "var(--danger)" }}>{title}</h2>
      <p className="muted">{message ?? "잠시 후 다시 시도하세요."}</p>
    </div>
  );
}

export function ErrorState({ title = "오류가 발생했습니다", message }: { title?: string; message?: string }) {
  return (
    <div className="page-card">
      <p className="eyebrow">오류</p>
      <h1>{title}</h1>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}

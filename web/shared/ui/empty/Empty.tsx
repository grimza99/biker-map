export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="page-card">
      <h1>{title}</h1>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}

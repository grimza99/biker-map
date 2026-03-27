export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="page-card">
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p className="muted">{message}</p>
    </div>
  );
}

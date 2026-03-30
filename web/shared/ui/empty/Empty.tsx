import { Surface } from "../surface";

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <Surface>
      <h1 className="m-0 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">{title}</h1>
      {message ? <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{message}</p> : null}
    </Surface>
  );
}

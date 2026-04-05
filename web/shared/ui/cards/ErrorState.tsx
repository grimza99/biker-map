import { DefaultCardContainer } from ".";

export function ErrorState({
  title = "오류가 발생했습니다",
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <DefaultCardContainer className="border-danger/20 bg-panel">
      <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-danger">
        오류
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text">
        {title}
      </h1>
      {message && (
        <p className="mt-3 text-sm leading-7 text-muted">{message}</p>
      )}
    </DefaultCardContainer>
  );
}

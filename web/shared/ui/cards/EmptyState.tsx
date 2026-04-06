import { cn } from "@/shared/lib";
import { DefaultCardContainer } from ".";

export function EmptyState({
  title,
  message,
  className,
}: {
  title: string;
  message?: string;
  className?: string;
}) {
  return (
    <DefaultCardContainer className="gap-3">
      <h1
        className={cn(
          "m-0 text-2xl font-semibold tracking-[-0.03em] text-text",
          className
        )}
      >
        {title}
      </h1>
      {message ? (
        <p className="mt-3 text-sm leading-7 text-muted">{message}</p>
      ) : null}
    </DefaultCardContainer>
  );
}

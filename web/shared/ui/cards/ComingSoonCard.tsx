import { Rocket } from "lucide-react";
import { ReactNode } from "react";
import { DefaultCardContainer } from "./DefaultCardContainer";

export function ComingSoonCard({
  title,
  description,
  status = "준비 중",
  containerClassName,
  footer,
}: {
  title: string;
  description: string;
  status?: string;
  containerClassName?: string;
  footer?: ReactNode;
}) {
  return (
    <DefaultCardContainer className={containerClassName} footer={footer}>
      <div className="flex items-center gap-3">
        <h3 className="m-0 text-lg font-semibold tracking-[-0.03em] text-text">
          {title}
        </h3>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
          <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
          {status}
        </span>
      </div>

      <p className="m-0 text-sm leading-7 text-muted">{description}</p>
    </DefaultCardContainer>
  );
}

import { DefaultCardContainer, ProfileImgChip } from "@/shared";
import { AppSession } from "@package-shared/index";

export function MyInfoSection({ session }: { session: AppSession }) {
  return (
    <DefaultCardContainer>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-3">
          <p className="m-0 text-md font-semibold uppercase tracking-[0.08em] text-accent">
            내 정보
          </p>
          <div className="flex items-center gap-4">
            <ProfileImgChip
              name={session.name}
              avatarUrl={session.avatarUrl ?? undefined}
              className="h-16 w-16 text-2xl"
            />
            <div className="grid gap-1">
              <h1 className="m-0 text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.04em] text-text">
                {session.name}
              </h1>
              <p className="m-0 text-sm text-muted">{session.email}</p>
            </div>
          </div>
        </div>
      </div>
    </DefaultCardContainer>
  );
}

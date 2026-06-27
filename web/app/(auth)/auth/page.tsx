import { AuthFormPanel } from "@features/auth";
import { APP_NAME, PATHS } from "@package-shared/constants";
import { PageWrapper } from "@shared/ui";
import Link from "next/link";

export default function AuthPage() {
  return (
    <PageWrapper className="w-full lg:max-w-100" innerClassName="gap-10">
      <div className="flex justify-center">
        <Link
          href={PATHS.map.entry}
          className="text-5xl text-accent font-extrabold"
        >
          {APP_NAME}
        </Link>
      </div>
      <AuthFormPanel />
    </PageWrapper>
  );
}

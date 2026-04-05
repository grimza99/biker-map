import { AuthFormPanel } from "@features/auth";
import { PageWrapper } from "@shared/ui";

export default function AuthPage() {
  return (
    <PageWrapper className="mx-auto max-w-160" innerClassName="gap-5">
      <AuthFormPanel />
    </PageWrapper>
  );
}

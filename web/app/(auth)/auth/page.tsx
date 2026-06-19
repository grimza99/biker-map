import { AuthFormPanel } from "@features/auth";
import { PageWrapper } from "@shared/ui";

export default function AuthPage() {
  return (
    <PageWrapper className="w-full lg:max-w-100" innerClassName="gap-5">
      <AuthFormPanel />
    </PageWrapper>
  );
}

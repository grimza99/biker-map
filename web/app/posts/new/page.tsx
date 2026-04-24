import { CommunityPostForm } from "@features/community";
import { PageWrapper } from "@shared/ui";

export default function NewPostPage() {
  return (
    <PageWrapper className="p-6" innerClassName="gap-5" pageTitle="게시글 작성">
      <div className="p-4">
        <CommunityPostForm />
      </div>
    </PageWrapper>
  );
}

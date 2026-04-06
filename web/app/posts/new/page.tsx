import { CommunityPostForm } from "@features/community";
import { PageWrapper } from "@shared/ui";

export default function NewPostPage() {
  return (
    <PageWrapper className="p-6" innerClassName="gap-5">
      <div className="grid gap-3">
        <h1 className="m-0 text-2xl font-semibold tracking-[-0.03em] text-text">
          게시글 작성
        </h1>
        <p className="m-0 text-sm leading-7 text-muted">
          질문, 정보, 자유 게시판에 공통으로 사용하는 게시글 작성 폼입니다.
        </p>
      </div>
      <CommunityPostForm />
    </PageWrapper>
  );
}

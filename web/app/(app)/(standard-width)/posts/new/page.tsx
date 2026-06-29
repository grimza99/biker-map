"use client";
import { useRouter } from "next/navigation";

import { CommunityPostForm } from "@features/community";
import { CreatePostResponseData, PATHS } from "@package-shared/index";
import { PageWrapper } from "@shared/ui";

export default function NewPostPage() {
  const router = useRouter();

  return (
    <PageWrapper className="p-6" innerClassName="gap-5" pageTitle="게시글 작성">
      <div className="p-4">
        <CommunityPostForm
          onSuccess={(data) => {
            const createdPost = data as CreatePostResponseData;
            router.push(PATHS.community.detailPost(createdPost.id));
          }}
        />
      </div>
    </PageWrapper>
  );
}

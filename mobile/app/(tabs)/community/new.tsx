import { type Href, Redirect, useRouter } from "expo-router";

import { AppScreen } from "@/components/shell";
import { DefaultCardContainer } from "@/components/common";
import { useSession } from "@/features/session/model";
import { MOBILE_PATHS } from "@/shared";
import { PostForm } from "@/features/community";

export default function CommunityNewPostScreen() {
  const router = useRouter();
  const { status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (status !== "authenticated") {
    return <Redirect href={MOBILE_PATHS.auth} />;
  }

  return (
    <AppScreen title="게시글 작성">
      <DefaultCardContainer>
        <PostForm
          onCancel={() => router.back()}
          onSuccess={(data) => {
            router.replace({
              pathname: MOBILE_PATHS.community.detail,
              params: { postId: data.id },
            } as unknown as Href);
          }}
        />
      </DefaultCardContainer>
    </AppScreen>
  );
}

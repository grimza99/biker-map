import { PostScreen } from "@widgets/screens";

export default async function PostDetailPage({
  params
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return <PostScreen postId={postId} />;
}

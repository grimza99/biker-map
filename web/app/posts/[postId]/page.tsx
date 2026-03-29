export default async function PostDetailPage({
  params
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return (
    <section className="page-card">
      <h1>게시글 상세</h1>
      <p className="muted">{postId}</p>
    </section>
  );
}

export function PostScreen({ postId }: { postId: string }) {
  return (
    <section className="page-card">
      <h1>게시글 상세</h1>
      <p className="muted">{postId}</p>
    </section>
  );
}

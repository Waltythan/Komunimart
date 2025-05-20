import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/PostDetail.css';

// Komentar dari backend
interface Comment {
  comment_id: string;
  user_id: string;
  text: string;             // backend pakai kolom "text"
  parent_id?: string | null; // Untuk reply
  author_name?: string; // opsional, jika backend mengirim nama user
}

const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch post detail & comments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const postRes = await fetch(`http://localhost:3000/posts/${postId}`);
        if (postRes.ok) setPost(await postRes.json());
        const commentRes = await fetch(`http://localhost:3000/posts/${postId}/comments`);
        if (commentRes.ok) setComments(await commentRes.json());
      } finally {
        setLoading(false);
      }
    };
    if (postId) fetchData();
  }, [postId]);

  // Submit comment or reply
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          user_id: "b4f6a9e6-0b70-4707-bfeb-e5638793d871", // sementara hardcode user_id
          parent_id: replyTo, // null jika komentar utama
        }),
      });
      if (!res.ok) throw new Error('Gagal menambah komentar');
      setNewComment('');
      setReplyTo(null);
      // Refresh comments
      const commentRes = await fetch(`http://localhost:3000/posts/${postId}/comments`);
      if (commentRes.ok) setComments(await commentRes.json());
    } catch (err) {
      alert('Gagal menambah komentar');
    }
  };

  // Render komentar dan reply secara nested
  const renderComments = (parentId: string | null = null, level = 0) =>
    comments
      .filter((c) => c.parent_id === parentId)
      .map((comment) => (
        <div key={comment.comment_id} className="comment-item" style={{ marginLeft: level * 24 }}>
          <strong>{comment.author_name || `User #${comment.user_id}`}</strong>: {comment.text}
          <button onClick={() => setReplyTo(comment.comment_id)}>Balas</button>
          {renderComments(comment.comment_id, level + 1)}
        </div>
      ));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="post-detail-container">
      <div className="post-content-box">
        <h2 className="post-title">{post?.title || `Judul Post #${postId}`}</h2>
        <p className="post-author">Oleh: User #{post?.author_id || postId}</p>
        <p className="post-body">{post?.content || 'Ini adalah isi lengkap dari postingan ini.'}</p>
      </div>
      <div className="comment-section">
        <h3>Komentar</h3>
        {renderComments()}
        <div className="comment-form">
          {replyTo && (
            <div style={{ marginBottom: 8 }}>
              Membalas komentar #{replyTo} <button onClick={() => setReplyTo(null)}>Batal</button>
            </div>
          )}
          <textarea
            placeholder={replyTo ? 'Tulis balasan...' : 'Tulis komentar...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Kirim</button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

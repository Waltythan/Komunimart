import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/PostDetail.css';
import '../styles/common.css';
import { getCurrentUserId } from '../../services/userServices';

// Komentar dari backend
interface Comment {
  comment_id: string;
  user_id: string;
  text: string;             // backend pakai kolom "text"
  parent_id?: string | null; // Untuk reply
  author_name?: string;     // opsional, jika backend mengirim nama user
  image_url?: string | null; // URL gambar (opsional)
}

const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Like functionality
  const [postLikes, setPostLikes] = useState<number>(0);
  const [postLiked, setPostLiked] = useState<boolean>(false);
  // Comment like state
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [commentLiked, setCommentLiked] = useState<Record<string, boolean>>({});
  // For simplicity, hardcode user_id (replace with auth context in production)
  const userId = getCurrentUserId();

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

  // Fetch post likes
  useEffect(() => {
    const fetchLikes = async () => {
      if (!postId) return;
      const userId = getCurrentUserId();
      let url = `http://localhost:3000/posts/likes/count?likeable_id=${postId}&likeable_type=Post`;
      if (userId) {
        url += `&user_id=${userId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPostLikes(data.count || 0);
        setPostLiked(data.likedByUser || false);
      }
    };
    fetchLikes();
  }, [postId, userId]);

  // Fetch comment likes when comments change
  useEffect(() => {
    const fetchCommentLikes = async () => {
      const userId = getCurrentUserId();
      const likeCounts: Record<string, number> = {};
      const likedStates: Record<string, boolean> = {};
      await Promise.all(
        comments.map(async (comment) => {
          let url = `http://localhost:3000/posts/likes/count?likeable_id=${comment.comment_id}&likeable_type=Comment`;
          if (userId) url += `&user_id=${userId}`;
          try {
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              likeCounts[comment.comment_id] = data.count || 0;
              likedStates[comment.comment_id] = data.likedByUser || false;
            } else {
              likeCounts[comment.comment_id] = 0;
              likedStates[comment.comment_id] = false;
            }
          } catch (e) {
            likeCounts[comment.comment_id] = 0;
            likedStates[comment.comment_id] = false;
          }
        })
      );
      setCommentLikes(likeCounts);
      setCommentLiked(likedStates);
    };
    if (comments.length > 0) fetchCommentLikes();
  }, [comments]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit comment or reply
  const handleAddComment = async () => {
    if (!newComment.trim() && !selectedImage) return;
    if (!userId) {
      alert('User tidak ditemukan. Silakan login ulang.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('text', newComment);
      formData.append('user_id', userId); // use real user_id
      
      if (replyTo) {
        formData.append('parent_id', replyTo);
      }
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const res = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Gagal menambah komentar');
      
      setNewComment('');
      setReplyTo(null);
      setSelectedImage(null);
      setImagePreview(null);
      
      // Refresh comments
      const commentRes = await fetch(`http://localhost:3000/posts/${postId}/comments`);
      if (commentRes.ok) setComments(await commentRes.json());
    } catch (err) {
      alert('Gagal menambah komentar');
    }
  };

  // Like post
  const handleLikePost = async () => {
    if (!postId || !userId) return;
    try {
      const res = await fetch(`http://localhost:3000/posts/likes`, {
        method: postLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          likeable_id: postId,
          likeable_type: 'Post',
        })
      });
      if (!res.ok) {
        let err;
        try {
          // Try to parse as JSON, but fallback to text if not JSON
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            err = await res.json();
          } else {
            err = { error: await res.text() };
          }
        } catch (parseErr) {
          err = { error: 'Unknown error (not JSON)' };
        }
        console.error('Like API error:', err);
        alert('Gagal melakukan like/unlike: ' + (err.error || res.status));
        return;
      }
      // After like/unlike, fetch the latest count from the database
      const countRes = await fetch(`http://localhost:3000/posts/likes/count?likeable_id=${postId}&likeable_type=Post&user_id=${userId}`);
      if (!countRes.ok) {
        let err;
        try {
          const contentType = countRes.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            err = await countRes.json();
          } else {
            err = { error: await countRes.text() };
          }
        } catch (parseErr) {
          err = { error: 'Unknown error (not JSON)' };
        }
        console.error('Like count API error:', err);
        alert('Gagal mengambil jumlah like: ' + (err.error || countRes.status));
        return;
      }
      const data = await countRes.json();
      setPostLikes(data.count || 0);
      setPostLiked(data.likedByUser || false);
      // Debug log
      console.debug('Like count response:', data);
    } catch (e) {
      console.error('Unexpected error in handleLikePost:', e);
      alert('Terjadi error saat like/unlike. Lihat console untuk detail.');
    }
  };

  // Render komentar dan reply secara nested
  const renderComments = (parentId: string | null = null, level = 0) =>
    comments
      .filter((c) => c.parent_id === parentId)
      .map((comment) => (
        <div key={comment.comment_id} className="comment-item" style={{ marginLeft: level * 24 }}>
          <strong>{comment.author_name || `User #${comment.user_id}`}</strong>: {comment.text}
          {/* Like button for comment */}
          <button style={{ marginLeft: 8 }} onClick={() => handleLikeComment(comment.comment_id)}>
            {commentLiked[comment.comment_id] ? 'Unlike' : 'Like'} ({commentLikes[comment.comment_id] || 0})
          </button>
          {comment.image_url && (
            <div className="comment-image">
              <img 
                src={`http://localhost:3000/uploads/comments/${comment.image_url}`}
                alt="Comment attachment"
                style={{ maxWidth: '200px', marginTop: '8px' }}
              />
            </div>
          )}
          <button onClick={() => setReplyTo(comment.comment_id)}>Balas</button>
          {renderComments(comment.comment_id, level + 1)}
        </div>
      ));

  // Like comment handler (with count and error handling)
  const handleLikeComment = async (commentId: string) => {
    if (!userId) {
      alert('User tidak ditemukan. Silakan login ulang.');
      return;
    }
    const liked = commentLiked[commentId];
    try {
      const res = await fetch(`http://localhost:3000/posts/likes`, {
        method: liked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          likeable_id: commentId,
          likeable_type: 'Comment',
        })
      });
      if (!res.ok) {
        let err;
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            err = await res.json();
          } else {
            err = { error: await res.text() };
          }
        } catch (parseErr) {
          err = { error: 'Unknown error (not JSON)' };
        }
        console.error('Comment Like API error:', err);
        alert('Gagal melakukan like/unlike komentar: ' + (err.error || res.status));
        return;
      }
      // After like/unlike, fetch the latest count from the database
      const countRes = await fetch(`http://localhost:3000/posts/likes/count?likeable_id=${commentId}&likeable_type=Comment&user_id=${userId}`);
      if (!countRes.ok) {
        let err;
        try {
          const contentType = countRes.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            err = await countRes.json();
          } else {
            err = { error: await countRes.text() };
          }
        } catch (parseErr) {
          err = { error: 'Unknown error (not JSON)' };
        }
        console.error('Comment Like count API error:', err);
        alert('Gagal mengambil jumlah like komentar: ' + (err.error || countRes.status));
        return;
      }
      const data = await countRes.json();
      setCommentLikes((prev) => ({ ...prev, [commentId]: data.count || 0 }));
      setCommentLiked((prev) => ({ ...prev, [commentId]: data.likedByUser || false }));
      // Debug log
      console.debug('Comment like count response:', data);
    } catch (e) {
      console.error('Unexpected error in handleLikeComment:', e);
      alert('Terjadi error saat like/unlike komentar. Lihat console untuk detail.');
    }
  };

  if (loading) return <div>Loading...</div>;  return (
    <div className="post-detail-container">
      <div className="post-content-box">
        <h2 className="post-title">{post?.title || `Judul Post #${postId}`}</h2>
        <p className="post-author">Oleh: User #{post?.author_id || postId}</p>
        <p className="post-body">{post?.content || 'Ini adalah isi lengkap dari postingan ini.'}</p>
        {/* Like button for post */}
        <button onClick={handleLikePost} style={{ marginBottom: 12 }}>
          {postLiked ? 'Unlike' : 'Like'} ({postLikes})
        </button>
        {post?.image_url && (
          <div className="post-image">
            <img 
              src={`http://localhost:3000/uploads/posts/${post.image_url}`}
              alt="Post attachment"
              style={{ maxWidth: '100%', marginTop: '16px' }}
            />
          </div>
        )}
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
          <div className="form-group">
            <label>Tambahkan Gambar (Opsional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img 
                  src={imagePreview} 
                  alt="Comment preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </div>
            )}
          </div>
          <button onClick={handleAddComment}>Kirim</button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

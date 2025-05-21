import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/PostDetail.css';
import '../styles/common.css';

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
    
    try {
      const formData = new FormData();
      formData.append('text', newComment);
      formData.append('user_id', "8f45c368-ec32-4766-bb15-a178aa924a16"); // sementara hardcode user_id
      
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

  // Render komentar dan reply secara nested
  const renderComments = (parentId: string | null = null, level = 0) =>
    comments
      .filter((c) => c.parent_id === parentId)
      .map((comment) => (
        <div key={comment.comment_id} className="comment-item" style={{ marginLeft: level * 24 }}>
          <strong>{comment.author_name || `User #${comment.user_id}`}</strong>: {comment.text}
          
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

  if (loading) return <div>Loading...</div>;  return (
    <div className="post-detail-container">
      <div className="post-content-box">
        <h2 className="post-title">{post?.title || `Judul Post #${postId}`}</h2>
        <p className="post-author">Oleh: User #{post?.author_id || postId}</p>
        <p className="post-body">{post?.content || 'Ini adalah isi lengkap dari postingan ini.'}</p>
        
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

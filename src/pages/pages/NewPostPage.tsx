import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/NewPostPage.css';

const NewPostPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    // Fetch post detail
    fetch(`http://localhost:3000/posts/${groupId}`)
      .then(res => res.json())
      .then(setPost);
    // Fetch comments
    fetch(`http://localhost:3000/posts/${groupId}/comments`)
      .then(res => res.json())
      .then(setComments);
  }, [groupId]);

  const handleSubmit = async () => {
    if (!title || !content) {
      alert('Judul dan isi harus diisi!');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          group_id: groupId,
          user_id: "b4f6a9e6-0b70-4707-bfeb-e5638793d871", // sementara hardcode user_id
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal menambahkan post');
      }

      alert('Post berhasil ditambahkan!');
      navigate(`/groups/${groupId}`);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="new-post-container">
      <h2>Buat Postingan Baru</h2>
      <div className="form-group">
        <label>Judul</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Masukkan judul postingan"
        />
      </div>
      <div className="form-group">
        <label>Isi</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Tulis isi postingan..."
        ></textarea>
      </div>
      <button onClick={handleSubmit}>Posting</button>
      {post && (
        <div className="post-detail">
          <h3>Detail Postingan</h3>
          <h4>{post.title}</h4>
          <p>{post.content}</p>
        </div>
      )}
      {comments.length > 0 && (
        <div className="comments-section">
          <h3>Komentar</h3>
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewPostPage;

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

type Comment = {
  id: string;
  author: string;
  content: string;
};

const PostDetailPage: React.FC = () => {
  const { postId } = useParams();
  const [post] = useState({
    id: postId,
    group: "React Enthusiasts",
    title: "React 19 Preview",
    author: "Admin A",
    createdAt: "2025-05-14",
    content: "React 19 introduces a new Suspense API, improved hydration, and much more...",
    likeCount: 42
  });

  const [comments, setComments] = useState<Comment[]>([
    { id: 'c1', author: 'User 1', content: 'Great preview!' },
    { id: 'c2', author: 'User 2', content: 'Looking forward to it!' }
  ]);

  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const newId = `c${Date.now()}`;
    setComments([...comments, { id: newId, author: "You", content: newComment }]);
    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-4">{post.group}</h1>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow space-y-3">
        <h2 className="text-xl font-bold">{post.title}</h2>
        <p className="text-sm text-gray-600">Oleh: {post.author}</p>
        <p className="text-sm text-gray-500">Tanggal: {post.createdAt}</p>
        <p className="mt-4 text-gray-800">{post.content}</p>
        <p className="text-sm font-semibold text-blue-600">Total Like: {post.likeCount}</p>

        <hr className="my-4" />

        <h3 className="font-bold">Komentar:</h3>
        <div className="space-y-2">
          {comments.map(comment => (
            <p key={comment.id}>
              <span className="font-semibold">{comment.author}</span>: {comment.content}
            </p>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-1">Tambah Komentar:</h4>
          <textarea
            className="w-full p-2 border rounded"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            onClick={handleAddComment}
            className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

type Comment = {
  id: string;
  author: string;
  content: string;
};

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group] = useState({
    id: groupId,
    name: "React Enthusiasts",
    description: "A group for React fans.",
  });
  const [comments, setComments] = useState<Comment[]>([
    { id: 'c1', author: 'User 1', content: 'Great preview!' },
    { id: 'c2', author: 'User 2', content: 'Looking forward to it!' }
  ]);
  const [newComment, setNewComment] = useState("");
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`http://localhost:3000/posts/group/${groupId}`);
      if (res.ok) setPosts(await res.json());
    };
    fetchPosts();
  }, [groupId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const newId = `c${Date.now()}`;
    setComments([...comments, { id: newId, author: "You", content: newComment }]);
    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-4">{group.name}</h1>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow space-y-3">
        <h2 className="text-xl font-bold">{group.name}</h2>
        <p className="text-gray-600">{group.description}</p>
        {/* New Post Button */}
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
          onClick={() => navigate(`/groups/${group.id}/new-post`)}
        >
          New Post
        </button>
        <hr className="my-4" />
        <h3 className="font-bold mb-2">Posts:</h3>
        <div className="space-y-2 mb-6">
          {posts.length === 0 && <div className="text-gray-400">Belum ada post.</div>}
          {posts.map(post => (
            <div key={post.post_id} className="border rounded p-3 bg-gray-50">
              <div className="font-semibold">{post.title}</div>
              <div className="text-gray-700 mb-1">{post.content}</div>
              <div className="text-xs text-gray-500">Oleh User #{post.author_id}</div>
            </div>
          ))}
        </div>
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

export default GroupDetailPage;

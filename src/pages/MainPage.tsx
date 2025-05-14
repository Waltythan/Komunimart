import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type Post = {
  id: string;
  title: string;
  author: string;
  content: string;
  commentsCount: number;
};

const MainPage: React.FC = () => {
  const [groupName] = useState("React Enthusiasts");
  const [posts] = useState<Post[]>([
    {
      id: '1',
      title: "React 19 Preview",
      author: "Admin A",
      content: "React 19 is coming soon with suspense and new features...",
      commentsCount: 3
    },
    {
      id: '2',
      title: "Komunimart Tips",
      author: "Admin B",
      content: "Want to improve your group engagement? Here are 5 quick tips...",
      commentsCount: 1
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-4">{groupName}</h1>
      <h2 className="text-xl font-semibold text-center mb-6">Postingan Terbaru</h2>

      <div className="max-w-2xl mx-auto space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-bold">{post.title}</h3>
            <p className="text-sm text-gray-600">Oleh: {post.author}</p>
            <p className="my-2 text-gray-700">{post.content.slice(0, 100)}...</p>
            <div className="flex justify-between text-sm text-blue-600">
              <Link to={`/post/${post.id}`} className="hover:underline">
                Lihat Selengkapnya
              </Link>
              <span>Komentar ({post.commentsCount})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainPage;

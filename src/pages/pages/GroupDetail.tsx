import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/MainPage.css';
import '../styles/GroupDetail.css';

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [groupName, setGroupName] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch group name
        const groupRes = await fetch(`http://localhost:3000/groups`);
        if (groupRes.ok) {
          const groups = await groupRes.json();
          const group = groups.find((g: any) => String(g.group_id) === groupId);
          setGroupName(group ? group.name : 'Unknown Group');
        }
        // Fetch posts for this group
        const postsRes = await fetch(`http://localhost:3000/posts/group/${groupId}`);
        if (postsRes.ok) {
          setPosts(await postsRes.json());
        }
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchData();
  }, [groupId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="main-container">
      <header className="main-header">
        <h1 className="app-title">Komunimart</h1>
        <p className="group-name">Grup: {groupName}</p>
      </header>
      <main className="feed-container">
        <h2 className="section-title">Postingan Terbaru</h2>
        <div style={{ marginBottom: 16 }}>
          <Link to={`/groups/${groupId}/new-post`} className="post-create-btn">
            + Buat Postingan Baru
          </Link>
        </div>
        <div className="post-list">
          {posts.map(post => (
            <div key={post.post_id} className="post-item">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-author">Oleh: User #{post.author_id}</p>
              <p className="post-content">{post.content.slice(0, 100)}...</p>
              <div className="post-footer">
                <Link to={`/post/${post.post_id}`} className="post-link">
                  Lihat Selengkapnya
                </Link>
                {/* Anda bisa menambahkan jumlah komentar jika tersedia */}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GroupDetailPage;

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../styles/MainPage.css';
import '../styles/GroupDetail.css';
import MembershipButton from '../components/MembershipButton';
import MembersList from '../components/MembersList';
import AdminPanel from '../components/AdminPanel';
import { getSessionData } from '../../services/authServices';

interface GroupDetails {
  group_id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
}

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch group details
        const groupRes = await fetch(`http://localhost:3000/groups`);
        if (groupRes.ok) {
          const groups = await groupRes.json();
          const group = groups.find((g: any) => String(g.group_id) === groupId);
          if (group) {
            setGroupDetails(group);
          } else {
            setError('Group not found');
          }
        }
      } catch (error) {
        console.error('Error fetching group details:', error);
        setError('Failed to load group details');
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchData();
  }, [groupId]);
  // Effect to fetch posts when membership status changes
  useEffect(() => {
    const fetchPosts = async () => {
      if (!groupId || !isMember) return;
      
      setLoading(true);
      try {
        // For now, use the regular posts endpoint while we fix the protected posts route
        const postsRes = await fetch(`http://localhost:3000/posts/group/${groupId}`);
        
        if (postsRes.ok) {
          setPosts(await postsRes.json());
        } else {
          const errorData = await postsRes.json();
          console.error('Error fetching posts:', errorData);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [groupId, isMember]);
  const handleMembershipChange = (membershipStatus: boolean) => {
    setIsMember(membershipStatus);
  };

  const handleAdminStatusChange = (adminStatus: boolean) => {
    setIsAdmin(adminStatus);
  };

  const handleGroupDeleted = () => {
    navigate('/groups');
  };

  if (loading && !groupDetails) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!groupDetails) return <div className="error-message">Group not found</div>;

  return (
    <div className="group-detail-container">
      <div className="group-header">
        <h1>{groupDetails.name}</h1>
        <p>{groupDetails.description || 'No description available'}</p>        <div className="group-action-bar">
          <MembershipButton 
            groupId={groupId || ''} 
            onMembershipChange={handleMembershipChange}
            onAdminStatusChange={handleAdminStatusChange}
          />
          {isAdmin && (
            <AdminPanel 
              groupId={groupId || ''} 
              onGroupDeleted={handleGroupDeleted}
            />
          )}
        </div>
      </div>

      {!isMember ? (
        <div className="group-access-restricted">
          <div className="restricted-message">
            <h3>You need to join this group to see its content</h3>
            <p>Join the group to view posts, participate in discussions, and more.</p>
          </div>
        </div>
      ) : (
        <div className="group-content">
          <div className="group-section posts-section">
            <h2>Postingan Terbaru</h2>
            <div className="post-actions">
              <Link to={`/groups/${groupId}/new-post`} className="post-create-btn">
                + Buat Postingan Baru
              </Link>
            </div>
            <div className="post-list">
              {posts.length === 0 ? (
                <p className="no-posts">No posts in this group yet. Be the first to post!</p>
              ) : (
                posts.map(post => (
                  <div key={post.post_id} className="post-item">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-author">
                      Oleh: {post.author?.uname || `User #${post.author_id}`}
                    </p>
                    <p className="post-content">
                      {post.content.length > 100 ? `${post.content.slice(0, 100)}...` : post.content}
                    </p>
                    <div className="post-footer">
                      <Link to={`/post/${post.post_id}`} className="post-link">
                        Lihat Selengkapnya
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="group-section members-section">
            <MembersList groupId={groupId || ''} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../styles/MainPage.css';
import '../styles/GroupDetail.css';
import MembershipButton from '../components/MembershipButton';
import MembersList from '../components/MembersList';
import AdminPanel from '../components/AdminPanel';
import { getSessionData } from '../../services/authServices';
import { getUserById } from '../../services/userServices';

interface GroupDetails {
  group_id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  image_url?: string;
}

interface Creator {
  user_id: string;
  uname: string;
  email?: string;
  profile_pic?: string | null;
}

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch group details
        const groupRes = await fetch(`http://localhost:3000/api/groups`);
        if (groupRes.ok) {
          const groups = await groupRes.json();
          const group = groups.find((g: any) => String(g.group_id) === groupId);
          if (group) {
            // Debug image URL format
            console.log('Group image URL format:', {
              original: group.image_url,
              isString: typeof group.image_url === 'string',
              isEmpty: !group.image_url
            });
            
            setGroupDetails(group);
            // Fetch creator details
            const creatorRes = await getUserById(group.created_by);
            if (creatorRes) {
              setCreator(creatorRes);
            }
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
      try {        // For now, use the regular posts endpoint while we fix the protected posts route
        const postsRes = await fetch(`http://localhost:3000/api/posts/group/${groupId}`);
        
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
  const handleGroupUpdated = () => {
    // Refresh group details after update
    if (groupId) {
      const fetchGroupDetails = async () => {
        try {
          const groupRes = await fetch(`http://localhost:3000/api/groups`);
          if (groupRes.ok) {
            const groups = await groupRes.json();
            const group = groups.find((g: any) => String(g.group_id) === groupId);
            if (group) {
              setGroupDetails(group);
              
              // Also refresh creator details if needed
              if (group.created_by) {
                try {
                  const creatorData = await getUserById(group.created_by);
                  if (creatorData) {
                    setCreator(creatorData);
                  }
                } catch (creatorError) {
                  console.error('Error refreshing creator details:', creatorError);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error refreshing group details:', error);
        }
      };
      fetchGroupDetails();
    }
  };

  if (loading && !groupDetails) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!groupDetails) return <div className="error-message">Group not found</div>;
  return (
    <div className="group-detail-container">
      <div className="group-header">        <div className="group-image-container">          {groupDetails.image_url ? (
            <img 
              src={
                groupDetails.image_url.startsWith('http') 
                  ? groupDetails.image_url 
                  : groupDetails.image_url.startsWith('/uploads') 
                    ? `http://localhost:3000${groupDetails.image_url}` 
                    : `http://localhost:3000/uploads/groups/${groupDetails.image_url}`
              } 
              alt={`${groupDetails.name} cover image`}
              className="group-cover-image"
              onError={(e) => {
                const imgUrl = e.currentTarget.src;
                console.error("Image loading error for URL:", imgUrl);
                
                // Try an alternate path format if the current one failed
                if (imgUrl.includes('/uploads/groups/')) {
                  const filename = imgUrl.split('/').pop();
                  if (filename) {
                    e.currentTarget.src = `http://localhost:3000/uploads/groups/${filename}`;
                    return;
                  }
                }
                
                // If all attempts fail, show placeholder
                e.currentTarget.src = `data:image/svg+xml;base64,${btoa('<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#E3E3E3"/><text x="50%" y="50%" font-family="Arial" font-size="40" font-weight="bold" fill="#888888" text-anchor="middle" dy=".3em">No Image</text></svg>')}`;
              }}
            />
          ) : (
            <div className="group-image-placeholder">
              <span>{groupDetails.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
        <h1>{groupDetails.name}</h1>
        <p>{groupDetails.description || 'No description available'}</p>
        
        {creator && (
          <div className="group-creator-info">
            <span className="creator-label">Created by:</span>
            <span className="creator-name">{creator.uname}</span>
            <span className="creation-date">
              {new Date(groupDetails.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
        
        <div className="group-action-bar">
          <MembershipButton 
            groupId={groupId || ''} 
            onMembershipChange={handleMembershipChange}
            onAdminStatusChange={handleAdminStatusChange}
          />{isAdmin && (
            <AdminPanel 
              groupId={groupId || ''} 
              groupName={groupDetails?.name}
              groupDescription={groupDetails?.description}
              groupImageUrl={groupDetails?.image_url}
              onGroupDeleted={handleGroupDeleted}
              onGroupUpdated={handleGroupUpdated}
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
                )))
              }
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

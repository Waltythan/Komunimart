import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../styles/MainPage.css';
import '../styles/GroupDetail.css';
import MembershipButton from '../components/MembershipButton';
import MembersList from '../components/MembersList';
import AdminPanel from '../components/AdminPanel';
import { getSessionData } from '../../services/authServices';
import { getUserById } from '../../services/userServices';
import { normalizeImageUrl, getFallbackImageSrc, BACKEND_URL } from '../utils/imageHelper';

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
          const groups = await groupRes.json();          const group = groups.find((g: any) => String(g.group_id) === groupId);
          if (group) {
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
  }, [groupId]);  // Effect to fetch posts when membership status changes
  useEffect(() => {
    const fetchPosts = async () => {
      if (!groupId || !isMember) return;
      
      setLoading(true);      try {
        const token = getSessionData();
        // Use the protected posts route to get posts with author information
        const postsRes = await fetch(`http://localhost:3000/api/protected-posts/group/${groupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
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
      <div className="group-header">        <div className="group-image-container">          {groupDetails.image_url ? (            <img 
              src={normalizeImageUrl(groupDetails.image_url, 'groups')}
              alt={`${groupDetails.name} cover image`}
              className="group-cover-image"              onError={(e) => {
                if (groupDetails.image_url) {
                  const filename = groupDetails.image_url.split('/').pop();
                  if (filename) {
                    // Determine which path to try based on current URL
                    const currentSrc = e.currentTarget.src;
                    
                    // If we're currently trying from groups subfolder, try root next
                    if (currentSrc.includes('/uploads/groups/')) {
                      e.currentTarget.src = `${BACKEND_URL}/uploads/${filename}`;
                      return;
                    }
                    
                    // If we're trying from root, try the groups subfolder next
                    if (currentSrc.includes('/uploads/') && !currentSrc.includes('/uploads/groups/')) {
                      e.currentTarget.src = `${BACKEND_URL}/uploads/groups/${filename}`;
                      return;
                    }
                  }
                }
                
                // Final fallback: placeholder image
                e.currentTarget.src = getFallbackImageSrc(200, 200, 40);
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
              ) : (                posts.map(post => (
                  <div key={post.post_id} className="post-item">
                    <div className="post-header">
                      <div className="post-author">                        <div className="author-avatar">
                          {post.author?.profile_pic ? (
                            <img 
                              src={normalizeImageUrl(post.author.profile_pic, 'profiles')}
                              alt={post.author.uname}                              onError={(e) => {
                                // Try direct URL without type folder as a fallback
                                const currentSrc = e.currentTarget.src;
                                if (currentSrc.includes('/uploads/profiles/')) {
                                  const filename = post.author.profile_pic.split('/').pop();
                                  e.currentTarget.src = `${BACKEND_URL}/uploads/${filename}`;
                                  return;
                                }
                                
                                // If that also fails, use initial
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const span = target.nextElementSibling as HTMLSpanElement;
                                if (span) span.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span style={{ display: post.author?.profile_pic ? 'none' : 'flex' }}>
                            {post.author?.uname?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="author-info">
                          <span className="author-name">{post.author?.uname || `User #${post.author_id}`}</span>
                          <span className="post-date">
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-content">
                      {post.content.length > 100 ? `${post.content.slice(0, 100)}...` : post.content}
                    </p>                    {post.image_url && post.image_url.trim() !== '' && (
                      <div className="post-preview-image">
                        <img 
                          src={normalizeImageUrl(post.image_url, 'posts')}
                          alt={post.title}                          onError={(e) => {
                            // Try direct URL without type folder first as a fallback
                            const currentSrc = e.currentTarget.src;
                            if (currentSrc.includes('/uploads/posts/')) {
                              const filename = post.image_url.split('/').pop();
                              e.currentTarget.src = `${BACKEND_URL}/uploads/${filename}`;
                              return;
                            }
                            
                            // If that also fails, use fallback image
                            e.currentTarget.src = getFallbackImageSrc(300, 200, 14);
                          }}
                        />
                      </div>
                    )}
                    
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

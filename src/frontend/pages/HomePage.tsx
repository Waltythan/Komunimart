import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  // Import all services from the central export
  getCurrentUserId,
  getUserGroups,
  addBookmark, 
  removeBookmark, 
  checkBookmarkStatus,
  getGroupPosts,
  addPostLike, 
  removePostLike, 
  getPostLikeCount,
  Post as ServicePost
} from '../../services';
import { normalizeImageUrl, getFallbackImageSrc } from '../utils/imageHelper';
import '../styles/HomePage.css';

// Helper function to adapt service post type to component post type
const adaptPostFormat = (post: ServicePost, groupInfo: {group_id: string, name: string}): Post => {
  return {
    post_id: post.id,
    title: post.title,
    content: post.content,
    author_id: post.created_by,
    created_at: post.created_at,
    image_url: post.image_url,
    group_id: post.group_id || groupInfo.group_id,
    author: {
      user_id: post.author?.id || post.created_by,
      uname: post.author?.username || 'Unknown',
      profile_pic: post.author?.profile_image
    },
    group: groupInfo
  };
};

interface Post {
  post_id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  image_url?: string;
  group_id: string;
  author: {
    user_id: string;
    uname: string;
    profile_pic?: string;
  };
  group: {
    group_id: string;
    name: string;
  };
  likeCount?: number;
  userLiked?: boolean;
}

interface Group {
  // Original field names used in the frontend components
  group_id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  created_by?: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarkedPosts, setBookmarkedPosts] = useState<{ [key: string]: boolean }>({});
  const [postLikes, setPostLikes] = useState<{ [key: string]: number }>({});
  const [postLiked, setPostLiked] = useState<{ [key: string]: boolean }>({});

  const userId = getCurrentUserId();
  useEffect(() => {
    if (!userId) {
      navigate('/', { replace: true });
      return;
    }

    const fetchHomePageData = async () => {
      setLoading(true);
      try {        // Fetch user's joined groups
        const userGroupsFromAPI = await getUserGroups(userId);
        
        // Map the service Group interface to the frontend Group interface
        const adaptedGroups = userGroupsFromAPI.map(group => ({
          group_id: group.id,
          name: group.name,
          description: group.description,
          image_url: group.image_url,
          created_at: group.created_at,
          created_by: group.created_by
        }));
        
        setGroups(adaptedGroups);

        if (adaptedGroups.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }        // Fetch posts from all joined groups
        const allPosts: Post[] = [];

        await Promise.all(
          adaptedGroups.map(async (group) => {
            try {              // Use the groupServices function to fetch posts
              const groupPosts = await getGroupPosts(group.group_id);
              
              // Convert service posts to component-compatible format
              const postsWithGroup = groupPosts.map((post) => 
                adaptPostFormat(post, {
                  group_id: group.group_id,
                  name: group.name
                })
              );
              allPosts.push(...postsWithGroup);
            } catch (error) {
              console.error(`Error fetching posts for group ${group.name}:`, error);
            }
          })
        );

        // Sort posts by creation date (newest first)
        const sortedPosts = allPosts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setPosts(sortedPosts);        // Fetch like status and counts for all posts
        await Promise.all(
          sortedPosts.map(async (post) => {
            try {
              const likeData = await getPostLikeCount(post.post_id, userId || undefined);
              setPostLikes(prev => ({ ...prev, [post.post_id]: likeData.count || 0 }));
              setPostLiked(prev => ({ ...prev, [post.post_id]: likeData.likedByUser || false }));
            } catch (error) {
              console.error(`Error fetching likes for post ${post.post_id}:`, error);
            }
          })
        );

        // Fetch bookmark status for all posts
        const bookmarkStatus: { [key: string]: boolean } = {};
        await Promise.all(
          sortedPosts.map(async (post) => {
            try {
              bookmarkStatus[post.post_id] = await checkBookmarkStatus(post.post_id);
            } catch (error) {
              console.error(`Error checking bookmark status for post ${post.post_id}:`, error);
              bookmarkStatus[post.post_id] = false;
            }
          })
        );
        setBookmarkedPosts(bookmarkStatus);

      } catch (err) {
        setError("Failed to load home page data");
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, [userId, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // If it's today, just show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // If it's this year, show date without year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Default full date
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const handleLikePost = async (postId: string) => {
    if (!userId) return;

    const isLiked = postLiked[postId];
    try {
      // Optimistic update
      setPostLiked(prev => ({ ...prev, [postId]: !isLiked }));
      setPostLikes(prev => ({ 
        ...prev, 
        [postId]: isLiked ? Math.max(0, (prev[postId] || 1) - 1) : (prev[postId] || 0) + 1 
      }));

      // Use the post service functions
      if (isLiked) {
        await removePostLike(postId, userId);
      } else {
        await addPostLike(postId, userId);
      }

      // Fetch updated count for accuracy
      const likeData = await getPostLikeCount(postId, userId);
      setPostLikes(prev => ({ ...prev, [postId]: likeData.count || 0 }));
      setPostLiked(prev => ({ ...prev, [postId]: likeData.likedByUser || false }));
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      setPostLiked(prev => ({ ...prev, [postId]: isLiked }));
      setPostLikes(prev => ({ 
        ...prev, 
        [postId]: isLiked ? (prev[postId] || 0) + 1 : Math.max(0, (prev[postId] || 1) - 1)
      }));
    }
  };

  const handleToggleBookmark = async (postId: string) => {
    const isBookmarked = bookmarkedPosts[postId];
    try {
      if (isBookmarked) {
        await removeBookmark(postId);
        setBookmarkedPosts(prev => ({ ...prev, [postId]: false }));
      } else {
        await addBookmark(postId);
        setBookmarkedPosts(prev => ({ ...prev, [postId]: true }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Home Page</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="home-page">
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h2>Welcome to Komunimart!</h2>
          <p>You haven't joined any groups yet. Join groups to see posts in your feed.</p>
          <Link to="/groups" className="join-groups-btn">
            Browse Groups
          </Link>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="home-page">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No Posts Yet</h2>
          <p>No one has posted in your groups yet. Be the first to share something!</p>
          <div className="action-buttons">
            <Link to="/groups" className="browse-groups-btn">
              Browse Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Your Feed</h1>
        <p>Latest posts from {groups.length} group{groups.length !== 1 ? 's' : ''} you've joined</p>
      </div>

      <div className="posts-feed">
        {posts.map(post => (
          <div key={post.post_id} className="post-card">
            <div className="post-header">
              <div className="post-author">
                <div className="author-avatar">
                  {post.author?.profile_pic ? (
                    <img 
                      src={normalizeImageUrl(post.author.profile_pic, 'profiles')}
                      alt={post.author.uname}
                      onError={(e) => {
                        const currentSrc = e.currentTarget.src;
                        if (currentSrc.includes('/uploads/profiles/') && post.author?.profile_pic) {
                          const filename = post.author.profile_pic.split('/').pop();
                          e.currentTarget.src = `http://localhost:3000/uploads/${filename}`;
                          return;
                        }
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
                  <div className="author-name">{post.author?.uname || `User ${post.author_id.substring(0, 5)}`}</div>
                  <div className="post-meta">
                    <Link to={`/groups/${post.group_id}`} className="group-link">
                      {post.group?.name}
                    </Link>
                    <span className="post-time">{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="post-content">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-text">{post.content}</p>

              {post.image_url && (
                <div className="post-image">
                  <img
                    src={normalizeImageUrl(post.image_url, 'posts')}
                    alt="Post content"
                    onError={(e) => {
                      const currentSrc = e.currentTarget.src;
                      if (currentSrc.includes('/uploads/posts/') && post.image_url) {
                        const filename = post.image_url.split('/').pop();
                        e.currentTarget.src = `http://localhost:3000/uploads/${filename}`;
                        return;
                      }
                      e.currentTarget.src = getFallbackImageSrc(400, 300, 16);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="post-actions">
              <div className="action-buttons">
                <button
                  className={`action-btn like-btn ${postLiked[post.post_id] ? 'active' : ''}`}
                  onClick={() => handleLikePost(post.post_id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046z" />
                  </svg>
                  Like
                  {postLikes[post.post_id] > 0 && <span className="count">({postLikes[post.post_id]})</span>}
                </button>                <Link to={`/post/${post.post_id}`} className="action-btn comment-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="0.5" viewBox="0 0 16 16">
                    <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z"/>
                    <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                  Comment
                </Link>

                <button
                  className={`action-btn bookmark-btn ${bookmarkedPosts[post.post_id] ? 'active' : ''}`}
                  onClick={() => handleToggleBookmark(post.post_id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
                  </svg>
                  {bookmarkedPosts[post.post_id] ? 'Saved' : 'Save'}
                </button>
              </div>

              <Link to={`/post/${post.post_id}`} className="view-post-btn">
                View Full Post
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;

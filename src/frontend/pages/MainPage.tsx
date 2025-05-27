import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getGroupMemberCount } from '../../services/membershipServices';
import { addBookmark, removeBookmark, checkBookmarkStatus } from '../../services/bookmarkServices';
import { getSessionData } from '../../services/authServices';
import { normalizeImageUrl, getFallbackImageSrc } from '../utils/imageHelper';
import '../styles/MainPage.css';

interface Post {
  post_id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  image_url?: string;
  comments_count?: number;
  likes_count?: number;
  author_name?: string;
}

interface Group {
  group_id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  created_by?: string;
  member_count?: number;
}

const MainPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarkedPosts, setBookmarkedPosts] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const token = getSessionData && getSessionData();
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch group details
        const groupRes = await fetch(`http://localhost:3000/api/groups`);
        let groups;
        if (!groupRes.ok) {
          // Only read the body once
          const errorText = await groupRes.text();
          console.error('[MainPage] Failed to fetch groups:', groupRes.status, errorText);
          throw new Error('Failed to fetch groups');
        } else {
          groups = await groupRes.json();
        }
        const currentGroup = groups.find((g: any) => String(g.group_id) === groupId);
        if (currentGroup) {
          // Fetch actual member count for this group
          const memberCount = await getGroupMemberCount(currentGroup.group_id);
          setGroup({
            ...currentGroup,
            member_count: memberCount
          });
        } else {
          setError("Group not found");
        }        // Fetch posts for this group
        const postsRes = await fetch(`http://localhost:3000/api/posts/group/${groupId}`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          // Enhance posts with placeholder data
          const enhancedPosts = postsData.map((post: Post) => ({
            ...post,
            comments_count: Math.floor(Math.random() * 10),
            likes_count: Math.floor(Math.random() * 20),
            author_name: `User ${post.author_id.substring(0, 5)}`,
          }));
          setPosts(enhancedPosts);
        }
      } catch (err) {
        setError("Failed to load group data");
        console.error('[MainPage] Caught error in fetchData:', err);
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchData();
  }, [groupId, navigate]);

  const handleNewPost = () => {
    navigate(`/groups/${groupId}/new-post`);
  };

  const handleToggleBookmark = async (postId: string) => {
    const isBookmarked = bookmarkedPosts[postId];
    if (isBookmarked) {
      await removeBookmark(postId);
      setBookmarkedPosts((prev) => ({ ...prev, [postId]: false }));
    } else {
      await addBookmark(postId);
      setBookmarkedPosts((prev) => ({ ...prev, [postId]: true }));
    }
  };

  useEffect(() => {
    // On mount, check bookmark status for all posts
    const fetchBookmarks = async () => {
      const status: { [key: string]: boolean } = {};
      for (const post of posts) {
        status[post.post_id] = await checkBookmarkStatus(post.post_id);
      }
      setBookmarkedPosts(status);
    };
    if (posts && posts.length > 0) fetchBookmarks();
  }, [posts]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading group content...</p>
      </div>
    );
  }
  
  if (error || !group) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error</h3>
        <p>{error || "Group not found"}</p>
        <button onClick={() => navigate('/groups')} className="back-button">
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="main-page">
      <div className="group-header-banner">
        <div className="group-cover-image">          {group.image_url ? (
            <img 
              src={normalizeImageUrl(group.image_url, 'groups')}
              alt={group.name}              onError={(e) => {
                // Try direct URL without type folder as a fallback
                const currentSrc = e.currentTarget.src;
                if (currentSrc.includes('/uploads/groups/') && group.image_url) {
                  const filename = group.image_url.split('/').pop();
                  if (filename) {
                    e.currentTarget.src = `http://localhost:3000/uploads/${filename}`;
                    return;
                  }
                }
                
                // If that fails too, use a custom SVG with the group name
                e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg width="800" height="200" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="200" fill="#F0F2F5"/><text x="400" y="110" text-anchor="middle" fill="#65676B" font-family="Arial" font-size="24" font-weight="bold">${group.name}</text></svg>`)}`;
              }}
            />
          ) : (
            <div className="cover-placeholder">{group.name.charAt(0).toUpperCase()}</div>
          )}
        </div>
        
        <div className="group-header-content">
          <div className="group-title-container">
            <h1 className="group-title">{group.name}</h1>
            <span className="group-member-count">{group.member_count} members</span>
          </div>
            <div className="group-actions button-container">
            <button className="action-button primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="action-icon">
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
              </svg>
              <span className="action-text">Joined</span>
            </button>
            <button className="action-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="action-icon">
                <path d="M8 16.016a7.5 7.5 0 0 0 1.962-14.74A1 1 0 0 0 9 0H7a1 1 0 0 0-.962 1.276A7.5 7.5 0 0 0 8 16.016zm6.5-7.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
                <path d="m6.94 7.44 4.95-2.83-2.83 4.95-4.949 2.83 2.828-4.95z"/>
              </svg>
              <span className="action-text">Invite</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="content-columns">
        <div className="left-sidebar">
          <div className="about-card">
            <h3 className="card-title">About</h3>
            <p className="group-description">
              {group.description || "No description provided for this group."}
            </p>
            <div className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/>
                <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              </svg>
              Created on {new Date(group.created_at || Date.now()).toLocaleDateString()}
            </div>
            <div className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
              {group.member_count} members
            </div>
            <div className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
              </svg>
              Public group
            </div>
          </div>
        </div>
        
        <div className="main-feed">          <div className="create-post-card">
            <button className="create-post-button" onClick={handleNewPost}>
              <div className="post-input-placeholder">
                <div className="avatar-circle">
                  <span>U</span>
                </div>
                <div className="input-placeholder">What's on your mind?</div>
              </div>
              <div className="post-actions flex-container">
                <div className="post-action">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="post-action-icon">
                    <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                    <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
                  </svg>
                  <span className="post-action-text">Photo</span>
                </div>
                <div className="post-action">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="post-action-icon">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M11 8a.5.5 0 0 1-.5.5H8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8.5H5.5a.5.5 0 0 1 0-1h1.793L5.354 5.854a.5.5 0 1 1 .708-.708L8.707 7.5h1.793a.5.5 0 0 1 .5.5z"/>
                  </svg>
                  <span className="post-action-text">Create</span>
                </div>
              </div>
            </button>
          </div>

          <div className="posts-container">
            {posts.length === 0 ? (
              <div className="empty-posts">
                <div className="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                    <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                </div>
                <h3>No posts yet</h3>
                <p>Be the first to create a post in this group</p>
                <button className="create-first-post" onClick={handleNewPost}>
                  Create Post
                </button>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.post_id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">
                        <span>{post.author_name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="author-info">
                        <p className="author-name">{post.author_name}</p>
                        <p className="post-time">{new Date(post.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="post-options">
                      <button className="options-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <Link to={`/post/${post.post_id}`} className="post-link">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-content">
                      {post.content.length > 300
                        ? `${post.content.slice(0, 300)}...`
                        : post.content}
                    </p>
                      {post.image_url && post.image_url?.trim() !== '' && (
                      <div className="post-image">
                        <img
                          src={normalizeImageUrl(post.image_url, 'posts')}
                          alt={post.title}                          onError={(e) => {
                            // Try direct URL without type folder as a fallback
                            const currentSrc = e.currentTarget.src;
                            if (currentSrc.includes('/uploads/posts/') && post.image_url) {
                              const filename = post.image_url.split('/').pop();
                              if (filename) {
                                e.currentTarget.src = `http://localhost:3000/uploads/${filename}`;
                                return;
                              }
                            }
                            
                            // If that also fails, use fallback image
                            e.currentTarget.src = getFallbackImageSrc(600, 400, 18);
                          }}
                        />
                      </div>
                    )}
                  </Link>

                  <div className="post-stats">
                    <div className="stats-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                      </svg>
                      <span>{post.likes_count}</span>
                    </div>
                    <div className="stats-item">
                      <span>{post.comments_count} comments</span>
                    </div>
                  </div>                  <div className="post-actions-bar button-container">
                    <button className="post-action-btn" aria-label="Like">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="post-btn-icon">
                        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046z"/>
                      </svg>
                      <span className="post-btn-text">Like</span>
                    </button>
                    <Link to={`/post/${post.post_id}`} className="post-action-btn" aria-label="Comment">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="post-btn-icon">
                        <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12z"/>
                        <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                      </svg>
                      <span className="post-btn-text">Comment</span>
                    </Link>
                    <button
                      className={`post-action-btn${bookmarkedPosts[post.post_id] ? ' active' : ''}`}
                      aria-label="Bookmark"
                      onClick={() => handleToggleBookmark(post.post_id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="post-btn-icon">
                        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.416V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                      </svg>
                      <span className="post-btn-text">{bookmarkedPosts[post.post_id] ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/PostDetail.css';
import '../styles/common.css';
import { getCurrentUserId } from '../../services/userServices';
import { getSessionData } from '../../services/authServices';
import PostActions from '../components/PostActions';
import CommentActions from '../components/CommentActions';
import { normalizeImageUrl, getFallbackImageSrc, debugImageUrl } from '../utils/imageHelper';

// Komentar dari backend
interface Comment {
  comment_id: string;
  author_id: string;
  text: string;             // backend pakai kolom "text"
  parent_id?: string | null; // Untuk reply
  author?: {                // author data from backend
    user_id: string;
    uname: string;
    profile_pic?: string;
  };
  image_url?: string | null; // URL gambar (opsional)
  created_at?: string;      // timestamp
}

const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyToName, setReplyToName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Like functionality
  const [postLikes, setPostLikes] = useState<number>(0);
  const [postLiked, setPostLiked] = useState<boolean>(false);
  // Comment like state
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [commentLiked, setCommentLiked] = useState<Record<string, boolean>>({});
  // For File upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  // For simplicity, hardcode user_id (replace with auth context in production)
  const userId = getCurrentUserId();
  // Restricted content state
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const [restrictedGroupId, setRestrictedGroupId] = useState<string | null>(null);

  // Fetch post detail & comments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getSessionData();
        
        // Use the protected post route that checks for group membership
        const postRes = await fetch(`http://localhost:3000/protected-posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (postRes.ok) {
          const postData = await postRes.json();
          setPost(postData);
          setIsRestricted(false);
        } else {
          const errorData = await postRes.json();
          if (postRes.status === 403 && errorData.error === 'Access denied') {
            // Set post with restricted info
            setIsRestricted(true);
            setRestrictedGroupId(errorData.group_id);
            return; // Don't try to load comments if access is denied
          }
        }
          // Only fetch comments if we have access to the post
        const commentRes = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (commentRes.ok) {
          const commentData = await commentRes.json();
          // Use author data from backend response
          const enhancedComments = commentData.map((comment: Comment) => ({
            ...comment,
            created_at: comment.created_at || new Date().toISOString(),
          }));
          setComments(enhancedComments);
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
      } finally {
        setLoading(false);
      }
    };
      if (postId) fetchData();
  }, [postId]);

  // Function to refresh comments
  const refreshComments = async () => {
    if (!postId) return;
    
    try {
      const token = getSessionData();
      const commentRes = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
        if (commentRes.ok) {
        const commentData = await commentRes.json();
        const enhancedComments = commentData.map((comment: Comment) => ({
          ...comment,
          created_at: comment.created_at || new Date().toISOString(),
        }));
        setComments(enhancedComments);
      }
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  };

  // Fetch post likes
  useEffect(() => {
    const fetchLikes = async () => {
      if (!postId) return;
      const userId = getCurrentUserId();
      let url = `http://localhost:3000/posts/likes/count?likeable_id=${postId}&likeable_type=Post`;
      if (userId) {
        url += `&user_id=${userId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPostLikes(data.count || 0);
        setPostLiked(data.likedByUser || false);
      }
    };
    fetchLikes();
  }, [postId, userId]);

  // Fetch comment likes when comments change
  useEffect(() => {
    const fetchCommentLikes = async () => {
      const userId = getCurrentUserId();
      const likeCounts: Record<string, number> = {};
      const likedStates: Record<string, boolean> = {};
      await Promise.all(
        comments.map(async (comment) => {
          let url = `http://localhost:3000/posts/likes/count?likeable_id=${comment.comment_id}&likeable_type=Comment`;
          if (userId) url += `&user_id=${userId}`;
          try {
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              likeCounts[comment.comment_id] = data.count || 0;
              likedStates[comment.comment_id] = data.likedByUser || false;
            } else {
              likeCounts[comment.comment_id] = 0;
              likedStates[comment.comment_id] = false;
            }
          } catch (e) {
            likeCounts[comment.comment_id] = 0;
            likedStates[comment.comment_id] = false;
          }
        })
      );
      setCommentLikes(likeCounts);
      setCommentLiked(likedStates);
    };
    if (comments.length > 0) fetchCommentLikes();
  }, [comments]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Open file picker
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Submit comment or reply
  const handleAddComment = async () => {
    if (!newComment.trim() && !selectedImage) return;
    if (!userId) {
      alert('User tidak ditemukan. Silakan login ulang.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('text', newComment);
      formData.append('user_id', userId); // use real user_id
      
      if (replyTo) {
        formData.append('parent_id', replyTo);
      }
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const res = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Gagal menambah komentar');
      
      setNewComment('');
      setReplyTo(null);
      setReplyToName(null);
      setSelectedImage(null);
      setImagePreview(null);
        // Refresh comments
      const commentRes = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${getSessionData()}`
        }
      });
      if (commentRes.ok) {
        const commentData = await commentRes.json();
        const enhancedComments = commentData.map((comment: Comment) => ({
          ...comment,
          created_at: comment.created_at || new Date().toISOString(),
        }));
        setComments(enhancedComments);
      }
    } catch (err) {
      alert('Gagal menambah komentar');
    }
  };

  // Like post
  const handleLikePost = async () => {
    if (!postId || !userId) return;
    try {
      const res = await fetch(`http://localhost:3000/posts/likes`, {
        method: postLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          likeable_id: postId,
          likeable_type: 'Post',
        })
      });
      if (!res.ok) {
        console.error('Like API error:', await res.text());
        return;
      }
      
      // Optimistic update
      setPostLiked(!postLiked);
      setPostLikes(prevLikes => postLiked ? prevLikes - 1 : prevLikes + 1);
      
      // After like/unlike, fetch the latest count from the database for accuracy
      const countRes = await fetch(`http://localhost:3000/posts/likes/count?likeable_id=${postId}&likeable_type=Post&user_id=${userId}`);
      if (countRes.ok) {
        const data = await countRes.json();
        setPostLikes(data.count || 0);
        setPostLiked(data.likedByUser || false);
      }
    } catch (e) {
      console.error('Unexpected error in handleLikePost:', e);
    }
  };

  // Handle reply to comment
  const handleReply = (commentId: string, authorName: string | undefined) => {
    setReplyTo(commentId);
    setReplyToName(authorName || `User ${commentId.substring(0, 5)}`);
    
    // Focus the textarea
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyTo(null);
    setReplyToName(null);
  };

  // Render komentar dan reply secara nested
  const renderComments = (parentId: string | null = null, level = 0) => {
    const filteredComments = comments.filter((c) => c.parent_id === parentId);
    
    return filteredComments.map((comment) => (
      <div 
        key={comment.comment_id} 
        className={`comment-item ${level > 0 ? 'reply-comment' : ''}`} 
        style={{ marginLeft: level * 24 }}
      >        <div className="comment-header">
          <div className="comment-author">            <div className="author-avatar">              {comment.author?.profile_pic ? (
                <img 
                  src={normalizeImageUrl(comment.author.profile_pic, 'profiles')}
                  alt={comment.author.uname}
                  onError={(e) => {
                    console.error(`Failed to load comment author profile image: ${e.currentTarget.src}`);
                    
                    // Try direct URL fallback
                    const currentSrc = e.currentTarget.src;
                    if (currentSrc.includes('/uploads/profiles/') && comment.author?.profile_pic) {
                      const filename = comment.author.profile_pic.split('/').pop();
                      e.currentTarget.src = `http://localhost:3000/uploads/${filename}`;
                      return;
                    }
                    
                    // Final fallback: hide image and show initial
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const span = target.nextElementSibling as HTMLSpanElement;
                    if (span) span.style.display = 'flex';
                  }}
                />
              ) : null}
              <span style={{ display: comment.author?.profile_pic ? 'none' : 'flex' }}>
                {comment.author?.uname?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="comment-content">
              <div className="comment-bubble">
                <div className="author-name">{comment.author?.uname || `User #${comment.author_id}`}</div>
                <div className="comment-text">{comment.text}</div>
                  {comment.image_url && (                <div className="comment-image">                      <img 
                      src={normalizeImageUrl(comment.image_url, 'comments')}
                      alt="Comment attachment"
                      onError={(e) => {
                        console.error(`Failed to load comment image: ${e.currentTarget.src}`);
                        debugImageUrl(comment.image_url);
                        
                        // Try direct URL without type folder as fallback
                        const currentSrc = e.currentTarget.src;
                        if (currentSrc.includes('/uploads/comments/') && comment.image_url) {
                          const filename = comment.image_url.split('/').pop();
                          e.currentTarget.src = `http://localhost:3000/uploads/${filename}`;
                          return;
                        }
                        
                        // Final fallback: placeholder image
                        e.currentTarget.src = getFallbackImageSrc(200, 150, 12);
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="comment-actions">
                <button 
                  className={`action-link ${commentLiked[comment.comment_id] ? 'active' : ''}`}
                  onClick={() => handleLikeComment(comment.comment_id)}
                >
                  Like
                </button>                <button 
                  className="action-link"
                  onClick={() => handleReply(comment.comment_id, comment.author?.uname)}
                >
                  Reply
                </button><span className="comment-time">
                  {formatDate(comment.created_at || new Date().toISOString())}
                </span>
                {commentLikes[comment.comment_id] > 0 && (
                  <span className="like-count">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046z"/>
                    </svg>
                    {commentLikes[comment.comment_id] || 0}
                  </span>
                )}                {/* Comment delete actions for admin/author */}
                <CommentActions 
                  commentId={comment.comment_id}
                  authorId={comment.author_id}
                  groupId={post?.group_id || ''}
                  onCommentDeleted={refreshComments}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Render nested replies */}
        {renderComments(comment.comment_id, level + 1)}
      </div>
    ));
  };

  // Like comment handler (with count and error handling)
  const handleLikeComment = async (commentId: string) => {
    if (!userId) {
      alert('User tidak ditemukan. Silakan login ulang.');
      return;
    }
    const liked = commentLiked[commentId];
    try {
      // Optimistic update
      setCommentLiked((prev) => ({ ...prev, [commentId]: !liked }));
      setCommentLikes((prev) => ({ 
        ...prev, 
        [commentId]: liked ? Math.max(0, (prev[commentId] || 1) - 1) : (prev[commentId] || 0) + 1 
      }));
      
      const res = await fetch(`http://localhost:3000/posts/likes`, {
        method: liked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          likeable_id: commentId,
          likeable_type: 'Comment',
        })
      });
      
      if (!res.ok) {
        console.error('Comment like API error:', await res.text());
        // Revert optimistic update on failure
        setCommentLiked((prev) => ({ ...prev, [commentId]: liked }));
        setCommentLikes((prev) => ({ 
          ...prev, 
          [commentId]: liked ? (prev[commentId] || 0) + 1 : Math.max(0, (prev[commentId] || 1) - 1) 
        }));
        return;
      }
      
      // After like/unlike, fetch the latest count from the database for accuracy
      const countRes = await fetch(`http://localhost:3000/posts/likes/count?likeable_id=${commentId}&likeable_type=Comment&user_id=${userId}`);
      if (countRes.ok) {
        const data = await countRes.json();
        setCommentLikes((prev) => ({ ...prev, [commentId]: data.count || 0 }));
        setCommentLiked((prev) => ({ ...prev, [commentId]: data.likedByUser || false }));
      }
    } catch (e) {
      console.error('Unexpected error in handleLikeComment:', e);
      // Revert optimistic update on error
      setCommentLiked((prev) => ({ ...prev, [commentId]: liked }));
      setCommentLikes((prev) => ({ 
        ...prev, 
        [commentId]: liked ? (prev[commentId] || 0) + 1 : Math.max(0, (prev[commentId] || 1) - 1) 
      }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Post Not Found</h3>
        <p>The post you're looking for could not be found.</p>
        <Link to="/groups" className="back-button">Back to Groups</Link>
      </div>
    );
  }

  // Render restricted content message
  if (isRestricted && restrictedGroupId) {
    return (
      <div className="post-detail-container">
        <div className="restricted-content">
          <div className="restricted-header">
            <Link to="/" className="back-btn">
              &larr; Back to Home
            </Link>
            <h2>Restricted Content</h2>
          </div>
          <div className="restricted-message">
            <div className="lock-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
            </div>
            <h3>This post is only available to group members</h3>
            <p>You need to join the group to view this content.</p>
            <button 
              className="join-group-btn"
              onClick={() => navigate(`/groups/${restrictedGroupId}`)}
            >
              Go to Group Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <div className="post-card">        <div className="post-header">
          <div className="post-author">            <div className="author-avatar">              {post.author?.profile_pic ? (
                <img 
                  src={normalizeImageUrl(post.author.profile_pic, 'profiles')}
                  alt={post.author.uname}
                  onError={(e) => {
                    console.error(`Failed to load profile image: ${e.currentTarget.src}`);
                    debugImageUrl(post.author.profile_pic);
                    
                    // Try direct URL without type folder as a fallback
                    const currentSrc = e.currentTarget.src;
                    if (currentSrc.includes('/uploads/profiles/')) {
                      const filename = post.author.profile_pic.split('/').pop();
                      if (filename) {
                        e.currentTarget.src = `http://localhost:3000/uploads/${filename}`;
                        console.log('Trying fallback profile URL:', e.currentTarget.src);
                        return;
                      }
                    }
                    
                    // If that also fails, hide the image and show the initials
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
              <div className="author-name">{post.author?.uname || `User #${post.author_id}`}</div>
              <div className="post-time">{formatDate(post.created_at || new Date().toISOString())}</div>
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

        <div className="post-content">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-body">{post.content}</p>          {post.image_url && post.image_url.trim() !== '' && (
            <div className="post-image">
              <img 
                src={normalizeImageUrl(post.image_url, 'posts')}
                alt={post.title}
                onError={(e) => {
                  console.error(`❌ PostDetail: Failed to load post image: ${e.currentTarget.src}`);
                  console.log(`📝 PostDetail: Original image_url: "${post.image_url}"`);
                  debugImageUrl(post.image_url);
                  
                  // Try direct URL without type folder as fallback
                  const currentSrc = e.currentTarget.src;
                  if (currentSrc.includes('/uploads/posts/')) {
                    const filename = post.image_url?.split('/').pop();
                    const fallbackUrl = `http://localhost:3000/uploads/${filename}`;
                    console.log(`🔄 PostDetail: Trying fallback URL: ${fallbackUrl}`);
                    e.currentTarget.src = fallbackUrl;
                    return;
                  }
                  
                  // Final fallback: placeholder image
                  console.log('🎨 PostDetail: Using placeholder fallback');
                  e.currentTarget.src = getFallbackImageSrc(600, 400, 18);
                }}
                onLoad={(e) => {
                  console.log(`✅ PostDetail: Successfully loaded post image: ${e.currentTarget.src}`);
                }}
              />
            </div>
          )}
          
          <div className="post-stats">
            {postLikes > 0 && (
              <div className="likes-count">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046z"/>
                </svg>
                {postLikes}
              </div>
            )}
            <div className="comments-count">
              {comments.length} comments
            </div>
          </div>
          
          <div className="post-actions-bar">
            <button 
              className={`post-action-btn ${postLiked ? 'active' : ''}`} 
              onClick={handleLikePost}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
              </svg>
              <span>{postLiked ? 'Liked' : 'Like'}</span>
            </button>
            <button className="post-action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
              </svg>
              <span>Comment</span>
            </button>
            <button className="post-action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
              </svg>              <span>Share</span>
            </button>
          </div>
          
          {/* Post delete actions for admin/author */}
          <PostActions 
            postId={post.post_id}
            authorId={post.author_id}
            groupId={post.group_id}
            onPostDeleted={() => navigate('/groups')}
          />
        </div>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">Comments</h3>
        
        <div className="comment-form">
          <div className="comment-input-container">
            <div className="avatar-circle">
              <span>U</span>
            </div>
            <div className="comment-input-wrapper">
              {replyTo && (
                <div className="replying-to">
                  Replying to {replyToName}
                  <button onClick={cancelReply} className="cancel-reply">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>
              )}
              <textarea
                ref={commentInputRef}
                placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-textarea"
              />
              
              <div className="comment-tools">
                <div className="comment-tools-left">
                  <button 
                    type="button" 
                    className="attach-button" 
                    onClick={handleAttachmentClick}
                    title="Attach an image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                      <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
                    </svg>
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="file-input" 
                  />
                </div>
                <button 
                  type="button" 
                  className="send-button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() && !selectedImage}
                >
                  Post
                </button>
              </div>
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    type="button"
                    className="remove-image"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            renderComments()
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

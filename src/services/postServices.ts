import apiFetch from './apiClient';
import { getCurrentUserId } from './userServices';

/**
 * Interface for Post data
 */
export interface Post {
  id: string;
  title: string;
  content: string;
  created_by: string;
  group_id?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
    profile_image?: string;
  };
}

/**
 * Interface for Comment data
 */
export interface Comment {
  id: string;
  content: string;
  post_id: string;
  created_by: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
    profile_image?: string;
  };
}

// ======== POST OPERATIONS ========

/**
 * Create a new protected post
 * @param formData - Form data containing post details
 * @returns Promise resolving to created post
 */
export async function createPost(formData: FormData): Promise<Post> {
  return apiFetch<Post>('/protected-posts', { method: 'POST', body: formData });
}

/**
 * Fetch a single protected post by ID
 * @param postId - ID of the post
 * @returns Promise resolving to post data
 */
export async function getProtectedPostById(postId: string): Promise<Post> {
  return apiFetch<Post>(`/protected-posts/${postId}`);
}

/**
 * Fetch posts for a group (requires authentication)
 * Note: This function is also available in groupServices.ts as getGroupPosts
 * @param groupId - ID of the group
 * @returns Promise resolving to array of posts
 */
export async function getProtectedPostsByGroup(groupId: string): Promise<Post[]> {
  return apiFetch<Post[]>(`/protected-posts/group/${groupId}`);
}

/**
 * Delete a post (admin or author only)
 * @param postId - ID of the post to delete
 * @returns Promise resolving to boolean indicating success
 */
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    await apiFetch(`/posts/admin/${postId}`, {
      method: 'DELETE',
      body: JSON.stringify({ deleted_by: getCurrentUserId() })
    });
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

// ======== COMMENT OPERATIONS ========

/**
 * Fetch comments for a post
 * @param postId - ID of the post
 * @returns Promise resolving to array of comments
 */
export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  return apiFetch<Comment[]>(`/posts/${postId}/comments`);
}

/**
 * Create a new comment on a protected post
 * @param postId - ID of the post
 * @param formData - Form data containing comment details
 * @returns Promise resolving to created comment
 */
export async function createCommentOnPost(postId: string, formData: FormData): Promise<Comment> {
  return apiFetch<Comment>(`/protected-posts/${postId}/comments`, { method: 'POST', body: formData });
}

/**
 * Delete a comment (admin or author only)
 * @param commentId - ID of the comment to delete
 * @returns Promise resolving to boolean indicating success
 */
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    await apiFetch(`/posts/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ deleted_by: getCurrentUserId() })
    });
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

// ======== LIKE OPERATIONS ========

// Like response interface
export interface LikeCountResponse {
  count: number;
  likedByUser: boolean;
}

// Get like count and whether current user liked the post
export async function getPostLikeCount(postId: string, userId?: string): Promise<LikeCountResponse> {
  let path = `/posts/likes/count?likeable_id=${postId}&likeable_type=Post`;
  if (userId) path += `&user_id=${userId}`;
  return apiFetch(path);
}

// Get like count and whether current user liked the comment
export async function getCommentLikeCount(commentId: string, userId?: string): Promise<LikeCountResponse> {
  let path = `/posts/likes/count?likeable_id=${commentId}&likeable_type=Comment`;
  if (userId) path += `&user_id=${userId}`;
  return apiFetch(path);
}

// Add a like to a post
export async function addPostLike(postId: string, userId: string): Promise<any> {
  return apiFetch('/posts/likes', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, likeable_id: postId, likeable_type: 'Post' })
  });
}

// Remove a like from a post
export async function removePostLike(postId: string, userId: string): Promise<any> {
  return apiFetch('/posts/likes', {
    method: 'DELETE',
    body: JSON.stringify({ user_id: userId, likeable_id: postId, likeable_type: 'Post' })
  });
}

// Add a like to a comment
export async function addCommentLike(commentId: string, userId: string): Promise<any> {
  return apiFetch('/posts/likes', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, likeable_id: commentId, likeable_type: 'Comment' })
  });
}

// Remove a like from a comment
export async function removeCommentLike(commentId: string, userId: string): Promise<any> {
  return apiFetch('/posts/likes', {
    method: 'DELETE',
    body: JSON.stringify({ user_id: userId, likeable_id: commentId, likeable_type: 'Comment' })
  });
}

// Group operations have been moved to groupServices.ts
// Import them from there instead

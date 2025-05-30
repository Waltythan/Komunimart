import { Request, Response } from 'express';
const db = require('../../../models');

export const addBookmark = async (req: Request, res: Response) => {
  try {
    const { user_id, post_id } = req.body;
    
    if (!user_id || !post_id) {
      res.status(400).json({ error: 'user_id and post_id are required' });
      return;
    }

    // Check if post exists
    const post = await db.Post.findByPk(post_id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check if bookmark already exists
    const existingBookmark = await db.Bookmark.findOne({
      where: { user_id, post_id }
    });

    if (existingBookmark) {
      // If bookmark exists but is not bookmarked, update it
      if (!existingBookmark.bookmarked) {
        existingBookmark.bookmarked = true;
        await existingBookmark.save();
        res.status(200).json(existingBookmark);
        return;
      } else {
        res.status(409).json({ error: 'Post already bookmarked' });
        return;
      }
    }

    // Create new bookmark
    const bookmark = await db.Bookmark.create({
      user_id,
      post_id,
      bookmarked: true
    });

    res.status(201).json(bookmark);
  } catch (err) {
    console.error('Error adding bookmark:', err);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
};

export const removeBookmark = async (req: Request, res: Response) => {
  try {
    const { user_id, post_id } = req.body;
    
    if (!user_id || !post_id) {
      res.status(400).json({ error: 'user_id and post_id are required' });
      return;
    }

    // Find existing bookmark
    const bookmark = await db.Bookmark.findOne({
      where: { user_id, post_id }
    });

    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    // Update bookmark to false instead of deleting
    bookmark.bookmarked = false;
    await bookmark.save();

    res.status(200).json({ message: 'Bookmark removed successfully' });
  } catch (err) {
    console.error('Error removing bookmark:', err);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
};

export const getUserBookmarks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const bookmarks = await db.Bookmark.findAll({
      where: {
        user_id: userId,
        bookmarked: true
      },
      include: [
        {
          model: db.Post,
          as: 'post',
          include: [
            {
              model: db.User,
              as: 'author',
              attributes: ['user_id', 'uname', 'profile_pic']
            },
            {
              model: db.Group,
              as: 'group',
              attributes: ['group_id', 'name', 'description']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Map bookmarks to include the bookmark creation date as 'bookmarkCreatedAt'
    // and get actual like/comment counts for each post
    const formattedBookmarks = [];
    
    for (const bookmark of bookmarks) {
      const plain = bookmark.toJSON();
      const postId = plain.post_id;
      
      // Get actual like count for this post
      const likesCount = await db.Like.count({
        where: {
          likeable_id: postId,
          likeable_type: 'Post'
        }
      });
      
      // Get actual comment count for this post
      const commentsCount = await db.Comment.count({
        where: { post_id: postId }
      });

      formattedBookmarks.push({
        ...plain.post, // all post info
        author: plain.post.author,
        group: plain.post.group,
        likes_count: likesCount,
        comments_count: commentsCount,
        bookmarkCreatedAt: plain.createdAt || plain.created_at
      });
    }

    res.status(200).json(formattedBookmarks);
  } catch (err) {
    console.error('Error fetching user bookmarks:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

export const checkBookmarkStatus = async (req: Request, res: Response) => {
  try {
    const { user_id, post_id } = req.query;
    
    if (!user_id || !post_id) {
      res.status(400).json({ error: 'user_id and post_id are required' });
      return;
    }

    // Validate post_id format - check if it's a valid UUID
    if (post_id === 'undefined' || post_id === 'null' || post_id === '' || 
        post_id === null || typeof post_id !== 'string' || 
        !post_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      res.status(200).json({ isBookmarked: false });
      return;
    }

    try {
      const bookmark = await db.Bookmark.findOne({
        where: { user_id, post_id, bookmarked: true }
      });

      res.status(200).json({ isBookmarked: !!bookmark });
    } catch (queryError) {
      // If there's a database error (likely due to invalid UUID format), return default value
      console.error('Database query error in checkBookmarkStatus:', queryError);
      res.status(200).json({ isBookmarked: false });
    }
  } catch (err) {
    console.error('Error checking bookmark status:', err);
    res.status(500).json({ error: 'Failed to check bookmark status' });
  }
};

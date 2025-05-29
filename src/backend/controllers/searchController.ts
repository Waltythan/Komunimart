import { Request, Response } from 'express';
import { Op } from 'sequelize';
const db = require('../../../models');
import { getImageUrl } from '../utils/fileUpload';

// Search for posts and groups
export const searchContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    const userId = req.body.user_id; // From authenticateJWT middleware

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const searchTerm = q.trim();
    if (searchTerm.length < 2) {
      res.status(400).json({ error: 'Search query must be at least 2 characters long' });
      return;
    }

    // Search for groups (public search - no membership required)
    const groups = await db.Group.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      attributes: ['group_id', 'name', 'description', 'image_url', 'created_at', 'created_by'],
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    // Process groups to include proper image URLs and member count
    const processedGroups = await Promise.all(
      groups.map(async (group: any) => {
        const groupData = group.toJSON();
        
        // Get member count
        const memberCount = await db.GroupMembership.count({
          where: { group_id: groupData.group_id }
        });

        return {
          ...groupData,
          image_url: getImageUrl(groupData.image_url, 'group'),
          member_count: memberCount
        };
      })
    );

    // Search for posts (only in groups where user is a member)
    let processedPosts = [];
    
    if (userId) {
      // Get groups where user is a member (including groups they created)
      const userGroups = await db.GroupMembership.findAll({
        where: { user_id: userId },
        attributes: ['group_id']
      });

      // Also include groups created by the user
      const createdGroups = await db.Group.findAll({
        where: { created_by: userId },
        attributes: ['group_id']
      });

      // Combine all accessible group IDs
      const accessibleGroupIds = [
        ...userGroups.map((membership: any) => membership.group_id),
        ...createdGroups.map((group: any) => group.group_id)
      ];

      // Remove duplicates
      const uniqueGroupIds = [...new Set(accessibleGroupIds)];

      if (uniqueGroupIds.length > 0) {
        const posts = await db.Post.findAll({
          where: {
            [Op.and]: [
              { group_id: { [Op.in]: uniqueGroupIds } },
              {
                [Op.or]: [
                  { title: { [Op.iLike]: `%${searchTerm}%` } },
                  { content: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          include: [
            {
              model: db.User,
              as: 'author',
              attributes: ['user_id', 'uname', 'profile_pic']
            },
            {
              model: db.Group,
              as: 'group',
              attributes: ['group_id', 'name']
            }
          ],
          limit: 20,
          order: [['created_at', 'DESC']]
        });

        // Process posts to include proper image URLs
        processedPosts = posts.map((post: any) => {
          const postData = post.toJSON();
          return {
            ...postData,
            image_url: getImageUrl(postData.image_url, 'post'),
            author: {
              ...postData.author,
              profile_pic: getImageUrl(postData.author?.profile_pic, 'profile')
            }
          };
        });
      }    }

    // Transform groups to match SearchResult interface
    const transformedGroups = processedGroups.map((group: any) => ({
      id: group.group_id,
      type: 'group' as const,
      title: group.name,
      description: group.description,
      imageUrl: group.image_url,
      memberCount: group.member_count,
      createdAt: group.created_at
    }));

    // Transform posts to match SearchResult interface
    const transformedPosts = processedPosts.map((post: any) => ({
      id: post.post_id,
      type: 'post' as const,
      title: post.title,
      content: post.content,
      groupName: post.group?.name,
      groupId: post.group_id,
      imageUrl: post.image_url,
      createdAt: post.created_at,
      author: post.author?.uname
    }));

    res.json({
      posts: transformedPosts,
      groups: transformedGroups,
      total: transformedGroups.length + transformedPosts.length
    });

  } catch (err) {
    console.error('Error in search:', err);
    res.status(500).json({ error: 'Failed to perform search' });
  }
};

// Get search suggestions based on partial query
export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    const searchTerm = q.trim();
    if (searchTerm.length < 1) {
      res.status(400).json({ error: 'Query must not be empty' });
      return;
    }

    // Get group name suggestions
    const groupSuggestions = await db.Group.findAll({
      where: {
        name: { [Op.iLike]: `%${searchTerm}%` }
      },
      attributes: ['group_id', 'name'],
      limit: 5,
      order: [['name', 'ASC']]
    });

    const suggestions = groupSuggestions.map((group: any) => ({
      type: 'group',
      id: group.group_id,
      text: group.name
    }));

    res.json({
      suggestions
    });

  } catch (err) {
    console.error('Error getting search suggestions:', err);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
};

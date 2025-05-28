
export interface SearchResult {
  id: number;
  type: 'post' | 'group';
  title: string;
  content?: string;
  groupName?: string;
  description?: string;
  imageUrl?: string;
  groupId?: number;
  memberCount?: number;
  createdAt?: string;
  author?: string;
}

export interface SearchResponse {
  posts: SearchResult[];
  groups: SearchResult[];
  total: number;
}

export interface SearchSuggestion {
  id: number;
  type: 'post' | 'group';
  title: string;
  groupName?: string;
}

// Search for posts and groups
export const searchContent = async (
  query: string,
  type: 'all' | 'posts' | 'groups' = 'all',
  limit: number = 20
): Promise<SearchResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const params = new URLSearchParams({
    q: query,
    type,
    limit: limit.toString()
  });

  const response = await fetch(`http://localhost:3000/api/search?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Search failed' }));
    throw new Error(errorData.message || 'Failed to search content');
  }

  return await response.json();
};

// Get search suggestions for autocomplete
export const getSearchSuggestions = async (
  query: string,
  limit: number = 5
): Promise<SearchSuggestion[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString()
  });

  const response = await fetch(`http://localhost:3000/api/search/suggestions?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to get suggestions' }));
    throw new Error(errorData.message || 'Failed to get search suggestions');
  }

  return await response.json();
};

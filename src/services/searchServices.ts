
import apiFetch from './apiClient';

/**
 * Interface for search result item
 */
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

/**
 * Interface for search response
 */
export interface SearchResponse {
  posts: SearchResult[];
  groups: SearchResult[];
  total: number;
}

/**
 * Interface for search suggestion
 */
export interface SearchSuggestion {
  id: number;
  type: 'post' | 'group';
  title: string;
  groupName?: string;
}

/**
 * Search for posts and groups
 * @param query - Search query string
 * @param type - Type of content to search
 * @param limit - Maximum number of results to return
 * @returns Promise resolving to search response
 */
export const searchContent = async (
  query: string,
  type: 'all' | 'posts' | 'groups' = 'all',
  limit: number = 20
): Promise<SearchResponse> => {
  const params = new URLSearchParams({
    q: query,
    type,
    limit: limit.toString()
  });

  return await apiFetch<SearchResponse>(`/search?${params}`);
};

/**
 * Get search suggestions for autocomplete
 * @param query - Search query string
 * @param limit - Maximum number of suggestions to return
 * @returns Promise resolving to array of search suggestions
 */
export const getSearchSuggestions = async (
  query: string,
  limit: number = 5
): Promise<SearchSuggestion[]> => {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString()
  });

  return await apiFetch<SearchSuggestion[]>(`/search/suggestions?${params}`);
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { searchContent, SearchResult, SearchResponse } from '../../services/searchServices';
import Navbar from '../components/Navbar';
import '../styles/SearchResults.css';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'groups'>('all');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query.trim()) {
      performSearch(query, activeTab);
    }
  }, [query, activeTab]);

  const performSearch = async (searchQuery: string, type: 'all' | 'posts' | 'groups') => {
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchContent(searchQuery, type, 20);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: SearchResult) => {
    if (post.groupId) {
      navigate(`/groups/${post.groupId}/posts/${post.id}`);
    }
  };

  const handleGroupClick = (group: SearchResult) => {
    navigate(`/groups/${group.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredResults = () => {
    if (!results) return { posts: [], groups: [] };
    
    switch (activeTab) {
      case 'posts':
        return { posts: results.posts, groups: [] };
      case 'groups':
        return { posts: [], groups: results.groups };
      default:
        return results;
    }
  };

  const filteredResults = getFilteredResults();
  const totalResults = filteredResults.posts.length + filteredResults.groups.length;

  return (
    <div className="search-results-page">
      <Navbar />
      <div className="search-results-container">
        <div className="search-header">
          <h1>Search Results</h1>
          {query && (
            <p className="search-query">
              Showing results for "<strong>{query}</strong>"
            </p>
          )}
        </div>

        {query && (
          <div className="search-tabs">
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({results?.total || 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts ({results?.posts.length || 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveTab('groups')}
            >
              Groups ({results?.groups.length || 0})
            </button>
          </div>
        )}

        <div className="search-content">
          {loading && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          )}

          {error && (
            <div className="search-error">
              <p>❌ {error}</p>
            </div>
          )}

          {!loading && !error && !query && (
            <div className="search-empty">
              <p>Enter a search term to find posts and groups</p>
            </div>
          )}

          {!loading && !error && query && totalResults === 0 && (
            <div className="search-no-results">
              <p>No results found for "{query}"</p>
              <p>Try different keywords or check your spelling</p>
            </div>
          )}

          {!loading && !error && results && totalResults > 0 && (
            <div className="search-results">
              {/* Groups Section */}
              {filteredResults.groups.length > 0 && (
                <div className="results-section">
                  <h2 className="section-title">Groups</h2>
                  <div className="groups-grid">
                    {filteredResults.groups.map((group) => (
                      <div
                        key={`group-${group.id}`}
                        className="group-card"
                        onClick={() => handleGroupClick(group)}
                      >
                        <div className="group-image">
                          {group.imageUrl ? (
                            <img src={group.imageUrl} alt={group.title} />
                          ) : (
                            <div className="group-placeholder">
                              <span>{group.title.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <div className="group-info">
                          <h3 className="group-title">{group.title}</h3>
                          {group.description && (
                            <p className="group-description">{group.description}</p>
                          )}
                          <div className="group-stats">
                            <span className="member-count">
                              {group.memberCount || 0} members
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Section */}
              {filteredResults.posts.length > 0 && (
                <div className="results-section">
                  <h2 className="section-title">Posts</h2>
                  <div className="posts-list">
                    {filteredResults.posts.map((post) => (
                      <div
                        key={`post-${post.id}`}
                        className="post-card"
                        onClick={() => handlePostClick(post)}
                      >
                        <div className="post-content">
                          <h3 className="post-title">{post.title}</h3>
                          {post.content && (
                            <p className="post-excerpt">
                              {post.content.length > 150
                                ? `${post.content.substring(0, 150)}...`
                                : post.content
                              }
                            </p>
                          )}
                          <div className="post-meta">
                            <span className="post-group">in {post.groupName}</span>
                            {post.author && <span className="post-author">by {post.author}</span>}
                            {post.createdAt && (
                              <span className="post-date">{formatDate(post.createdAt)}</span>
                            )}
                          </div>
                        </div>
                        {post.imageUrl && (
                          <div className="post-image">
                            <img src={post.imageUrl} alt={post.title} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;

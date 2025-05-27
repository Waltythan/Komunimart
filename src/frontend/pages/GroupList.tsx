import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroupMemberCount } from '../../services/membershipServices';
import { normalizeImageUrl, getFallbackImageSrc} from '../utils/imageHelper';
import '../styles/GroupList.css';
import '../styles/common.css';

type Group = {
  group_id: string;
  name: string;
  description: string;
  image_url?: string | null;
  member_count?: number; // Added member count
};

const GroupListPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('http://localhost:3000/groups');
        if (!res.ok) throw new Error('Failed to fetch groups');
        const data = await res.json();
          // Fetch actual member count for each group
        const enhancedData = await Promise.all(
          data.map(async (group: Group) => {
            const memberCount = await getGroupMemberCount(group.group_id);
            return {
              ...group,
              member_count: memberCount
            };
          })
        );
        
        setGroups(enhancedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading groups...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
      </svg>
      <p>Error: {error}</p>
      <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
    </div>
  );
  
  return (
    <div className="group-list-page">
      <div className="group-list-header">
        <div className="search-filter-container">
          <div className="search-box">
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg> */}
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/groups/new')} 
          className="new-group-btn"
          aria-label="Create new group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          <span>Create Group</span>
        </button>
      </div>
      
      <div className="group-cards-container">
        {filteredGroups.length === 0 ? (
          <div className="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
            </svg>
            <p>No groups found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="group-grid">
            {filteredGroups.map((group) => (
              <div
                key={group.group_id}
                className="group-card"
                onClick={() => navigate(`/groups/${group.group_id}`)}
              >
                <div className="group-card-top">                  {group.image_url ? (
                    <div className="group-cover-image">
                      <img
                        src={normalizeImageUrl(group.image_url, 'groups')}
                        alt={group.name}                        onError={(e) => {
                          // Try direct URL without type folder as fallback
                          const currentSrc = e.currentTarget.src;
                          if (currentSrc.includes('/uploads/groups/')) {
                            const filename = group.image_url?.split('/').pop();
                            e.currentTarget.src = `http://localhost:3000/uploads/${filename}`;
                            return;
                          }
                          
                          // Final fallback: placeholder image
                          e.currentTarget.src = getFallbackImageSrc(300, 100, 18);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="group-cover-placeholder">
                      <span>{group.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                
                <div className="group-card-content">
                  <h3 className="group-name">{group.name}</h3>
                  
                  <div className="group-meta">
                    <span className="group-members">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                      </svg>
                      {group.member_count} members
                    </span>
                  </div>
                  
                  {group.description && (
                    <p className="group-description">
                      {group.description.length > 80 
                        ? `${group.description.substring(0, 80)}...` 
                        : group.description}
                    </p>
                  )}
                  
                  <button className="view-group-btn">
                    View Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupListPage;

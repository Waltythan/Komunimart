import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GroupList.css';
import '../styles/common.css';

type Group = {
  group_id: string;
  name: string;
  description: string;
  image_url?: string | null;
};

const GroupListPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('http://localhost:3000/groups');
        if (!res.ok) throw new Error('Gagal mengambil data grup');
        const data = await res.json();
        console.log('Fetched groups:', data); // Debug data
        setGroups(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) return <div className="group-loading">Loading...</div>;
  if (error) return <div className="group-error">Error: {error}</div>;

  return (
    <div className="group-list-page">
      <h2>Daftar Grup</h2>
      <button onClick={() => navigate('/groups/new')} className="new-group-btn">
        + Buat Grup Baru
      </button>
      <div className="group-list">
        {groups.map((group) => (
          <div
            key={group.group_id}
            className="group-card"
            onClick={() => navigate(`/groups/${group.group_id}`)}
          >
            {group.image_url ? (
              <div className="group-image">
                <img
                  src={`http://localhost:3000/uploads/groups/${group.image_url}`}
                  alt={group.name}
                  onError={(e) => {
                    console.error(`Failed to load image for group ${group.name}: ${group.image_url}`);
                    e.currentTarget.src = `https://via.placeholder.com/80?text=${group.name.charAt(0)}`;
                  }}
                />
              </div>
            ) : (
              <div className="group-image-placeholder">
                {group.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="group-info">
              <h3 className="group-name">{group.name}</h3>
              {group.description && (
                <p className="group-description">{group.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupListPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GroupList.css';

type Group = {
  group_id: number;
  name: string;
  description: string;
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
      <div className="group-header">
        <h2>Grup Anda</h2>
        <button onClick={() => navigate('/groups/new')} className="group-create-btn">
          + Buat Grup Baru
        </button>
      </div>
      <div className="group-list">
        {groups.map(group => (
          <div
            key={group.group_id}
            className="group-item"
            onClick={() => navigate(`/groups/${group.group_id}`)}
          >
            <div className="group-name">{group.name}</div>
            <div className="group-desc">{group.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupListPage;

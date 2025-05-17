import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

type Group = {
  id: number;
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
        if (!res.ok) throw new Error('Failed to fetch groups');
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

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <h1 className="text-2xl font-bold text-center mb-6">Nama Aplikasi</h1>

      <div className="flex justify-center mb-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
          Buat Grup Baru
        </button>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {groups.map(group => (
          <div key={group.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{group.name}</h2>
            <p className="text-gray-600">{group.description}</p>
            <button onClick={() => navigate(`/groups/${group.id}`)} className="text-blue-500 hover:underline">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupListPage;

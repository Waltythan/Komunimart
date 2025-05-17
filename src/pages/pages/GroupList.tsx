import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

type Group = {
  group_id: number;
  name: string;
  description: string;
};

const GroupListPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
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
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          onClick={() => setShowForm(!showForm)}
        >
          Buat Grup Baru
        </button>
      </div>
      {showForm && (
        <div className="max-w-xl mx-auto mb-4 bg-white p-4 rounded shadow">
          <input
            className="block w-full mb-2 p-2 border rounded"
            type="text"
            placeholder="Nama Grup"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
          />
          <input
            className="block w-full mb-2 p-2 border rounded"
            type="text"
            placeholder="Deskripsi Grup"
            value={newGroupDesc}
            onChange={e => setNewGroupDesc(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            onClick={async () => {
              if (!newGroupName) return alert('Nama grup wajib diisi');
              try {
                const res = await fetch('http://localhost:3000/groups', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newGroupName, description: newGroupDesc }),
                });
                if (!res.ok) throw new Error('Gagal membuat grup');
                setNewGroupName('');
                setNewGroupDesc('');
                setShowForm(false);
                // Refresh group list
                setLoading(true);
                setError('');
                const refreshed = await fetch('http://localhost:3000/groups');
                setGroups(await refreshed.json());
              } catch (err: any) {
                alert('Gagal membuat grup: ' + err.message);
              }
            }}
          >
            Simpan
          </button>
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded"
            onClick={() => setShowForm(false)}
          >
            Batal
          </button>
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-4">
        {groups.map(group => (
          <div key={group.group_id} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{group.name}</h2>
            <p className="text-gray-600">{group.description}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => navigate(`/groups/${group.group_id}`)} className="text-blue-500 hover:underline">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupListPage;

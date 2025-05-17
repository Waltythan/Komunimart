import React, { useState } from 'react';

type Group = {
  id: number;
  name: string;
  description: string;
};

const GroupListPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: "React Enthusiasts", description: "All about React tips & tricks." },
    { id: 2, name: "Komunimart Devs", description: "Build and collaborate on Komunimart." }
  ]);

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
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupListPage;

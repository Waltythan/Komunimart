import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GroupList.css';

const NewGroupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Nama grup wajib diisi');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, created_by: "b4f6a9e6-0b70-4707-bfeb-e5638793d871" }), // sementara hardcode user_id
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal membuat grup');
      }
      alert('Grup berhasil dibuat!');
      navigate('/groups');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="group-list-page">
      <h2>Buat Grup Baru</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nama Grup</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama grup"
          />
        </div>
        <div className="form-group">
          <label>Deskripsi</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Deskripsi grup (opsional)"
          />
        </div>
        <button type="submit">Buat Grup</button>
      </form>
    </div>
  );
};

export default NewGroupPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../../services/userServices';
import '../styles/GroupList.css';
import '../styles/common.css';

const NewGroupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Nama grup wajib diisi');
      return;
    }
    const userId = getCurrentUserId();
    if (!userId) {
      alert('User tidak ditemukan. Silakan login ulang.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('created_by', userId); // use real user_id
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const res = await fetch('http://localhost:3000/groups', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header
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
  };  return (
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
        <div className="form-group">
          <label>Gambar Grup (Opsional)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img 
                src={imagePreview} 
                alt="Group preview" 
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
            </div>
          )}
        </div>
        <button type="submit">Buat Grup</button>
      </form>
    </div>
  );
};

export default NewGroupPage;
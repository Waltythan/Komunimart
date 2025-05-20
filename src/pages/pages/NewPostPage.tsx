import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/NewPostPage.css';
import '../styles/common.css';

const NewPostPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      alert('Judul dan isi harus diisi!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('group_id', groupId || '');
      formData.append('user_id', "8f45c368-ec32-4766-bb15-a178aa924a16"); // sementara hardcode user_id
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await fetch(`http://localhost:3000/posts`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal menambahkan post');
      }

      alert('Post berhasil ditambahkan!');
      navigate(`/groups/${groupId}`);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="new-post-container">
      <h2>Buat Postingan Baru</h2>
      <div className="form-group">
        <label>Judul</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Masukkan judul postingan"
        />
      </div>
      <div className="form-group">
        <label>Isi</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Tulis isi postingan..."
        ></textarea>
      </div>
      <div className="form-group">
        <label>Gambar (Opsional)</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange}
        />
        {imagePreview && (
          <div className="image-preview">
            <img 
              src={imagePreview} 
              alt="Post preview" 
              style={{ maxWidth: '100%', maxHeight: '200px' }}
            />
          </div>
        )}
      </div>
      <button onClick={handleSubmit}>Posting</button>
    </div>
  );
};

export default NewPostPage;

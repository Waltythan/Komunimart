import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUserId } from '../../services/userServices';
import { checkGroupMembership, isGroupCreator } from '../../services/membershipServices';
import { getSessionData } from '../../services/authServices';
import { createPost } from '../../services/postServices';
import { getGroupById } from '../../services/groupServices';
import '../styles/NewPostPage.css';
import '../styles/common.css';

const NewPostPage: React.FC = () => {  const { groupId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [groupName, setGroupName] = useState('');

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

    const userId = getCurrentUserId();
    if (!userId) {
      alert('User tidak ditemukan. Silakan login ulang.');
      return;
    }    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('group_id', groupId || '');
      formData.append('user_id', userId); // use real user_id
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // Use centralized post service
      await createPost(formData);

      alert('Post berhasil ditambahkan!');
      navigate(`/groups/${groupId}`);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }; 
  // Check if user is a member of the group or the creator
  useEffect(() => {
    const verifyGroupAccess = async () => {
      setLoading(true);
      try {
        if (!groupId) {
          navigate('/groups');
          return;
        }

        const userId = getCurrentUserId();
        if (!userId) {
          navigate('/login');
          return;
        }        // Fetch group details
        const groupData = await getGroupById(groupId);
        setGroupName(groupData.name || 'Group');
        
        // Check if user is the creator
        if (groupData.created_by === userId) {
          setIsCreator(true);
          setIsMember(true); // Creators are automatically members
          setLoading(false);
          return; // No need to check membership if user is creator
        }

        // Check if user is a member of the group
        const membershipStatus = await checkGroupMembership(groupId, userId);
        setIsMember(membershipStatus);
        
        if (!membershipStatus && !isCreator) {
          setTimeout(() => {
            navigate(`/groups/${groupId}`);
          }, 3000); // Redirect after 3 seconds
        }
      } catch (error) {
        console.error('Error checking group access:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyGroupAccess();
  }, [groupId, navigate]);
    if (loading) {
    return <div className="loading-container">Checking group access...</div>;
  }

  if (!isMember && !isCreator) {
    return (
      <div className="restricted-container">
        <div className="restricted-message">
          <h2>Access Denied</h2>
          <p>You need to be a member of this group to create a post.</p>
          <p>Redirecting you to the group page...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="new-post-container">
      <h2>Create Post in {groupName}</h2>
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

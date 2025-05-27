import React, { useState, useEffect } from 'react';
import { updateGroup } from '../../services/postServices';
import '../styles/EditGroupForm.css';
import { normalizeImageUrl } from '../utils/imageHelper';

interface EditGroupFormProps {
  groupId: string;
  currentName: string;
  currentDescription: string;
  currentImageUrl?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditGroupForm: React.FC<EditGroupFormProps> = ({
  groupId,
  currentName,
  currentDescription,
  currentImageUrl,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);  useEffect(() => {
    if (currentImageUrl) {
      // Use the normalizeImageUrl utility for consistent URL handling
      const normalizedUrl = normalizeImageUrl(currentImageUrl, 'groups');
      setImagePreview(normalizedUrl);
    }
  }, [currentImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Group name is required');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const success = await updateGroup(groupId, formData);
      
      if (success) {
        alert('Group updated successfully!');
        onSuccess();
      } else {
        alert('Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Error updating group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-group-modal">
      <div className="edit-group-content">
        <h3>Edit Group</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Group Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
            />            {imagePreview && (
              <div className="image-preview">
                <img 
                  src={imagePreview} 
                  alt="Group preview" 
                  style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'cover' }}
                  onError={(e) => {
                    console.error(`Failed to load preview image: ${e.currentTarget.src}`);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupForm;

import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { FaTimes, FaUpload, FaFile } from 'react-icons/fa';
import { uploadDocument } from '../../services/api';

const DocumentUpload = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: '',
  });

  const queryClient = useQueryClient();

  const uploadMutation = useMutation(uploadDocument, {
    onSuccess: () => {
      toast.success('Document uploaded successfully!');
      queryClient.invalidateQueries('documents');
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!documentData.title) {
        setDocumentData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ''),
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', documentData.title);
    formData.append('description', documentData.description);
    formData.append('category', documentData.category);
    formData.append('tags', documentData.tags.split(',').map(tag => tag.trim()));

    uploadMutation.mutate(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Upload Document</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>Document Title *</label>
            <input
              type="text"
              value={documentData.title}
              onChange={(e) => setDocumentData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Enter document title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={documentData.description}
              onChange={(e) => setDocumentData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter document description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={documentData.category}
              onChange={(e) => setDocumentData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="faq">FAQ</option>
              <option value="policy">Policy</option>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={documentData.tags}
              onChange={(e) => setDocumentData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., pricing, support, returns"
            />
          </div>

          <div className="file-upload-area">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileSelect}
              accept=".pdf,.docx,.txt,.md"
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              {selectedFile ? (
                <>
                  <FaFile className="file-icon" />
                  <span>{selectedFile.name}</span>
                  <span className="file-size">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </>
              ) : (
                <>
                  <FaUpload className="upload-icon" />
                  <span>Click or drag to upload</span>
                  <span className="file-types">Supported: PDF, DOCX, TXT, MD</span>
                </>
              )}
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={uploadMutation.isLoading}>
              {uploadMutation.isLoading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUpload;
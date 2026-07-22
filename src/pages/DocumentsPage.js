import React, { useState, useRef, useEffect } from 'react';
import { 
  FaUpload, 
  FaSearch, 
  FaFileAlt, 
  FaTrash, 
  FaEdit, 
  FaTimes, 
  FaFilePdf, 
  FaFileWord, 
  FaFileCode,
  FaFile,
  FaCloudUploadAlt,
  FaSpinner,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEye,
  FaTag,
  FaCalendarAlt,
  FaWeightHanging
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getDocuments, uploadDocument, deleteDocument } from '../services/api';

const DocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const popupRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: '',
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'faq', label: 'FAQ', icon: '❓' },
    { value: 'policy', label: 'Policy', icon: '📋' },
    { value: 'product', label: 'Product', icon: '📦' },
    { value: 'service', label: 'Service', icon: '⚡' },
    { value: 'general', label: 'General', icon: '📄' },
  ];

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle click outside popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        if (!isLoading) {
          setShowUploadPopup(false);
        }
      }
    };

    if (showUploadPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showUploadPopup, isLoading]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      if (response.data && response.data.data) {
        setDocuments(response.data.data);
      } else if (Array.isArray(response.data)) {
        setDocuments(response.data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    const fileType = type?.toLowerCase() || '';
    switch(fileType) {
      case 'pdf': return <FaFilePdf className="file-icon pdf" />;
      case 'docx': return <FaFileWord className="file-icon docx" />;
      case 'doc': return <FaFileWord className="file-icon docx" />;
      case 'txt': return <FaFileCode className="file-icon txt" />;
      case 'md': return <FaFileCode className="file-icon txt" />;
      default: return <FaFile className="file-icon" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      faq: '#4F46E5',
      policy: '#7C3AED',
      product: '#059669',
      service: '#D97706',
      general: '#6B7280',
    };
    return colors[category?.toLowerCase()] || colors.general;
  };

  const getCategoryBadge = (category) => {
    const labels = {
      faq: 'FAQ',
      policy: 'Policy',
      product: 'Product',
      service: 'Service',
      general: 'General',
    };
    return labels[category?.toLowerCase()] || category || 'General';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (!formData.title) {
      setFormData(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, '')
      }));
    }
    toast.success(`File selected: ${file.name}`);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append('file', selectedFile);
    formDataToSend.append('title', formData.title || selectedFile.name);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('category', formData.category);
    formDataToSend.append('tags', formData.tags || '');

    try {
      const response = await uploadDocument(formDataToSend);
      
      if (response.data && response.data.success) {
        toast.success('Document uploaded successfully!');
        await fetchDocuments();
        setShowUploadPopup(false);
        setSelectedFile(null);
        setFormData({ title: '', description: '', category: 'general', tags: '' });
        setUploadProgress(100);
      } else {
        toast.error(response.data?.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        toast.success('Document deleted successfully');
        await fetchDocuments();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.error || 'Failed to delete document');
      }
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const title = doc.title || '';
    const description = doc.description || '';
    const tags = doc.tags || [];
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || (doc.category && doc.category.toLowerCase() === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.created_at || a.createdAt || 0);
      const dateB = new Date(b.created_at || b.createdAt || 0);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    } else if (sortBy === 'title') {
      const titleA = (a.title || '').toLowerCase();
      const titleB = (b.title || '').toLowerCase();
      return sortOrder === 'desc' ? titleB.localeCompare(titleA) : titleA.localeCompare(titleB);
    } else if (sortBy === 'size') {
      const sizeA = a.file_size || a.size || 0;
      const sizeB = b.file_size || b.size || 0;
      return sortOrder === 'desc' ? sizeB - sizeA : sizeA - sizeB;
    }
    return 0;
  });

  const openUploadPopup = () => {
    setShowUploadPopup(true);
    setSelectedFile(null);
    setFormData({ title: '', description: '', category: 'general', tags: '' });
  };

  const closeUploadPopup = () => {
    if (!isLoading) {
      setShowUploadPopup(false);
      setSelectedFile(null);
      setFormData({ title: '', description: '', category: 'general', tags: '' });
    }
  };

  if (loading) {
    return (
      <div className="documents-page">
        <div className="loading-container">
          <div className="loader">Loading documents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">📄 Documents</h1>
          <p className="page-subtitle">Manage your business documents and knowledge base</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary upload-btn"
            onClick={openUploadPopup}
          >
            <FaCloudUploadAlt /> Upload Document
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-value">{documents.length}</span>
          <span className="stat-label">Total Documents</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{documents.filter(d => d.category === 'faq').length}</span>
          <span className="stat-label">FAQs</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{documents.filter(d => d.category === 'product').length}</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{documents.filter(d => d.category === 'policy').length}</span>
          <span className="stat-label">Policies</span>
        </div>
      </div>

      {/* Controls */}
      <div className="document-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search documents by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="filter-group">
          <div className="filter-box">
            <FaFilter className="filter-icon" />
            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-box">
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">📅 Date</option>
              <option value="title">📝 Title</option>
              <option value="size">📦 Size</option>
            </select>
            <button 
              className="sort-direction"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
            </button>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      {sortedDocuments.length === 0 ? (
        <div className="empty-state">
          <FaFileAlt className="empty-icon" />
          <h3>No documents found</h3>
          <p>Upload your first document to get started</p>
          <button className="btn-primary" onClick={openUploadPopup}>
            <FaUpload /> Upload Document
          </button>
        </div>
      ) : (
        <div className="document-grid">
          {sortedDocuments.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="card-header">
                <div className="file-icon-wrapper">
                  {getFileIcon(doc.file_type || doc.type)}
                </div>
                <div className="card-info">
                  <h4 className="card-title">{doc.title || 'Untitled'}</h4>
                  {doc.description && (
                    <p className="card-description">{doc.description}</p>
                  )}
                </div>
                <span className="category-badge" style={{ background: getCategoryColor(doc.category) }}>
                  {getCategoryBadge(doc.category)}
                </span>
              </div>
              
              {doc.tags && doc.tags.length > 0 && (
                <div className="card-tags">
                  {doc.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      <FaTag className="tag-icon" /> {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="card-footer">
                <div className="card-meta">
                  <span>
                    <FaCalendarAlt className="meta-icon" />
                    {formatDate(doc.created_at || doc.createdAt)}
                  </span>
                  <span>
                    <FaWeightHanging className="meta-icon" />
                    {formatFileSize(doc.file_size || doc.size)}
                  </span>
                </div>
                <div className="card-actions">
                  <button className="action-btn view" title="View">
                    <FaEye />
                  </button>
                  <button className="action-btn edit" title="Edit">
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete" 
                    onClick={() => handleDelete(doc.id)} 
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Popup */}
      {showUploadPopup && (
        <div className="upload-popup-overlay">
          <div className="upload-popup" ref={popupRef}>
            {/* Popup Header */}
            <div className="upload-popup-header">
              <div className="popup-header-content">
                <div className="popup-icon-wrapper">
                  <FaCloudUploadAlt className="popup-icon" />
                </div>
                <div>
                  <h2>Upload Document</h2>
                  <p>Upload documents to improve your AI assistant's knowledge</p>
                </div>
              </div>
              <button 
                className="popup-close-btn" 
                onClick={closeUploadPopup}
                disabled={isLoading}
              >
                <FaTimes />
              </button>
            </div>

            {/* Popup Body */}
            <form onSubmit={handleSubmit} className="upload-popup-body">
              <div className="popup-form-row">
                <div className="popup-form-group">
                  <label>Document Title <span className="required">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter document title"
                    className="popup-form-input"
                    required
                  />
                </div>

                <div className="popup-form-group">
                  <label>Category <span className="required">*</span></label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="popup-form-select"
                    required
                  >
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="popup-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter document description"
                  className="popup-form-textarea"
                  rows="2"
                />
              </div>

              <div className="popup-form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., support, pricing, faq"
                  className="popup-form-input"
                />
              </div>

              {/* File Upload Area */}
              <div 
                className={`popup-file-upload-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'file-selected' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="popup-file-input"
                  accept=".pdf,.docx,.txt,.md"
                />
                {selectedFile ? (
                  <div className="popup-file-selected-info">
                    <FaFileAlt className="selected-file-icon" />
                    <div className="file-info">
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button 
                      type="button"
                      className="remove-file"
                      onClick={() => setSelectedFile(null)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="popup-file-drop-content">
                    <FaCloudUploadAlt className="upload-icon" />
                    <span className="drop-text">Drag & drop your file here</span>
                    <span className="drop-subtext">or click to browse</span>
                    <span className="file-types">Supports: PDF, DOCX, TXT, MD (Max 10MB)</span>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isLoading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{uploadProgress}% uploaded</span>
                </div>
              )}

              {/* Popup Footer */}
              <div className="popup-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={closeUploadPopup}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary upload-submit"
                  disabled={isLoading || !selectedFile}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="spinner" /> Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload /> Upload Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;












// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   FaUpload, 
//   FaSearch, 
//   FaFileAlt, 
//   FaTrash, 
//   FaEdit, 
//   FaTimes, 
//   FaFilePdf, 
//   FaFileWord, 
//   FaFileCode,
//   FaFile,
//   FaCloudUploadAlt,
//   FaSpinner,
//   FaFilter,
//   FaSortAmountDown,
//   FaSortAmountUp,
//   FaEye,
//   FaTag,
//   FaCalendarAlt,
//   FaWeightHanging
// } from 'react-icons/fa';
// import toast from 'react-hot-toast';
// import { getDocuments, uploadDocument, deleteDocument } from '../services/api';

// const DocumentsPage = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [sortBy, setSortBy] = useState('date');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [isLoading, setIsLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const fileInputRef = useRef(null);
  
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     category: 'general',
//     tags: '',
//   });

//   const categories = [
//     { value: 'all', label: 'All Categories' },
//     { value: 'faq', label: 'FAQ', icon: '❓' },
//     { value: 'policy', label: 'Policy', icon: '📋' },
//     { value: 'product', label: 'Product', icon: '📦' },
//     { value: 'service', label: 'Service', icon: '⚡' },
//     { value: 'general', label: 'General', icon: '📄' },
//   ];

//   // Fetch documents on component mount
//   useEffect(() => {
//     fetchDocuments();
//   }, []);

//   const fetchDocuments = async () => {
//     try {
//       setLoading(true);
//       const response = await getDocuments();
//       if (response.data && response.data.data) {
//         setDocuments(response.data.data);
//       } else if (Array.isArray(response.data)) {
//         setDocuments(response.data);
//       } else {
//         setDocuments([]);
//       }
//     } catch (error) {
//       console.error('Error fetching documents:', error);
//       toast.error('Failed to load documents');
//       setDocuments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getFileIcon = (type) => {
//     const fileType = type?.toLowerCase() || '';
//     switch(fileType) {
//       case 'pdf': return <FaFilePdf className="file-icon pdf" />;
//       case 'docx': return <FaFileWord className="file-icon docx" />;
//       case 'doc': return <FaFileWord className="file-icon docx" />;
//       case 'txt': return <FaFileCode className="file-icon txt" />;
//       case 'md': return <FaFileCode className="file-icon txt" />;
//       default: return <FaFile className="file-icon" />;
//     }
//   };

//   const getCategoryColor = (category) => {
//     const colors = {
//       faq: '#4F46E5',
//       policy: '#7C3AED',
//       product: '#059669',
//       service: '#D97706',
//       general: '#6B7280',
//     };
//     return colors[category?.toLowerCase()] || colors.general;
//   };

//   const getCategoryBadge = (category) => {
//     const labels = {
//       faq: 'FAQ',
//       policy: 'Policy',
//       product: 'Product',
//       service: 'Service',
//       general: 'General',
//     };
//     return labels[category?.toLowerCase()] || category || 'General';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes) return 'N/A';
//     if (bytes < 1024) return bytes + ' B';
//     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
//     return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       const file = e.dataTransfer.files[0];
//       handleFileSelect(file);
//     }
//   };

//   const handleFileSelect = (file) => {
//     setSelectedFile(file);
//     if (!formData.title) {
//       setFormData(prev => ({
//         ...prev,
//         title: file.name.replace(/\.[^/.]+$/, '')
//       }));
//     }
//     toast.success(`File selected: ${file.name}`);
//   };

//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       handleFileSelect(e.target.files[0]);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!selectedFile) {
//       toast.error('Please select a file to upload');
//       return;
//     }

//     setIsLoading(true);
//     setUploadProgress(0);

//     const formDataToSend = new FormData();
//     formDataToSend.append('file', selectedFile);
//     formDataToSend.append('title', formData.title || selectedFile.name);
//     formDataToSend.append('description', formData.description || '');
//     formDataToSend.append('category', formData.category);
//     formDataToSend.append('tags', formData.tags || '');

//     try {
//       const response = await uploadDocument(formDataToSend);
      
//       if (response.data && response.data.success) {
//         toast.success('Document uploaded successfully!');
//         await fetchDocuments(); // Refresh the list
//         setShowUploadModal(false);
//         setSelectedFile(null);
//         setFormData({ title: '', description: '', category: 'general', tags: '' });
//         setUploadProgress(100);
//       } else {
//         toast.error(response.data?.error || 'Failed to upload document');
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//       toast.error(error.response?.data?.error || 'Failed to upload document');
//     } finally {
//       setIsLoading(false);
//       setUploadProgress(0);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this document?')) {
//       try {
//         await deleteDocument(id);
//         toast.success('Document deleted successfully');
//         await fetchDocuments(); // Refresh the list
//       } catch (error) {
//         console.error('Delete error:', error);
//         toast.error(error.response?.data?.error || 'Failed to delete document');
//       }
//     }
//   };

//   const filteredDocuments = documents.filter(doc => {
//     const title = doc.title || '';
//     const description = doc.description || '';
//     const tags = doc.tags || [];
    
//     const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                           description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                           tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
//     const matchesCategory = selectedCategory === 'all' || (doc.category && doc.category.toLowerCase() === selectedCategory);
//     return matchesSearch && matchesCategory;
//   });

//   const sortedDocuments = [...filteredDocuments].sort((a, b) => {
//     if (sortBy === 'date') {
//       const dateA = new Date(a.created_at || a.createdAt || 0);
//       const dateB = new Date(b.created_at || b.createdAt || 0);
//       return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
//     } else if (sortBy === 'title') {
//       const titleA = (a.title || '').toLowerCase();
//       const titleB = (b.title || '').toLowerCase();
//       return sortOrder === 'desc' ? titleB.localeCompare(titleA) : titleA.localeCompare(titleB);
//     } else if (sortBy === 'size') {
//       const sizeA = a.file_size || a.size || 0;
//       const sizeB = b.file_size || b.size || 0;
//       return sortOrder === 'desc' ? sizeB - sizeA : sizeA - sizeB;
//     }
//     return 0;
//   });

//   if (loading) {
//     return (
//       <div className="documents-page">
//         <div className="loading-container">
//           <div className="loader">Loading documents...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="documents-page">
//       {/* Page Header */}
//       <div className="page-header">
//         <div className="header-left">
//           <h1 className="page-title">📄 Documents</h1>
//           <p className="page-subtitle">Manage your business documents and knowledge base</p>
//         </div>
//         <div className="header-actions">
//           <button 
//             className="btn-primary upload-btn"
//             onClick={() => setShowUploadModal(true)}
//           >
//             <FaCloudUploadAlt /> Upload Document
//           </button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="stats-row">
//         <div className="stat-item">
//           <span className="stat-value">{documents.length}</span>
//           <span className="stat-label">Total Documents</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-value">{documents.filter(d => d.category === 'faq').length}</span>
//           <span className="stat-label">FAQs</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-value">{documents.filter(d => d.category === 'product').length}</span>
//           <span className="stat-label">Products</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-value">{documents.filter(d => d.category === 'policy').length}</span>
//           <span className="stat-label">Policies</span>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="document-controls">
//         <div className="search-box">
//           <FaSearch className="search-icon" />
//           <input
//             type="text"
//             placeholder="Search documents by title, description, or tags..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="search-input"
//           />
//           {searchTerm && (
//             <button className="clear-search" onClick={() => setSearchTerm('')}>
//               <FaTimes />
//             </button>
//           )}
//         </div>

//         <div className="filter-group">
//           <div className="filter-box">
//             <FaFilter className="filter-icon" />
//             <select 
//               className="filter-select"
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//             >
//               {categories.map(cat => (
//                 <option key={cat.value} value={cat.value}>
//                   {cat.icon} {cat.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="sort-box">
//             <select 
//               className="sort-select"
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//             >
//               <option value="date">📅 Date</option>
//               <option value="title">📝 Title</option>
//               <option value="size">📦 Size</option>
//             </select>
//             <button 
//               className="sort-direction"
//               onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
//             >
//               {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Document Grid */}
//       {sortedDocuments.length === 0 ? (
//         <div className="empty-state">
//           <FaFileAlt className="empty-icon" />
//           <h3>No documents found</h3>
//           <p>Upload your first document to get started</p>
//           <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
//             <FaUpload /> Upload Document
//           </button>
//         </div>
//       ) : (
//         <div className="document-grid">
//           {sortedDocuments.map((doc) => (
//             <div key={doc.id} className="document-card">
//               <div className="card-header">
//                 <div className="file-icon-wrapper">
//                   {getFileIcon(doc.file_type || doc.type)}
//                 </div>
//                 <div className="card-info">
//                   <h4 className="card-title">{doc.title || 'Untitled'}</h4>
//                   {doc.description && (
//                     <p className="card-description">{doc.description}</p>
//                   )}
//                 </div>
//                 <span className="category-badge" style={{ background: getCategoryColor(doc.category) }}>
//                   {getCategoryBadge(doc.category)}
//                 </span>
//               </div>
              
//               {doc.tags && doc.tags.length > 0 && (
//                 <div className="card-tags">
//                   {doc.tags.map((tag, index) => (
//                     <span key={index} className="tag">
//                       <FaTag className="tag-icon" /> {tag}
//                     </span>
//                   ))}
//                 </div>
//               )}
              
//               <div className="card-footer">
//                 <div className="card-meta">
//                   <span>
//                     <FaCalendarAlt className="meta-icon" />
//                     {formatDate(doc.created_at || doc.createdAt)}
//                   </span>
//                   <span>
//                     <FaWeightHanging className="meta-icon" />
//                     {formatFileSize(doc.file_size || doc.size)}
//                   </span>
//                 </div>
//                 <div className="card-actions">
//                   <button className="action-btn view" title="View">
//                     <FaEye />
//                   </button>
//                   <button className="action-btn edit" title="Edit">
//                     <FaEdit />
//                   </button>
//                   <button 
//                     className="action-btn delete" 
//                     onClick={() => handleDelete(doc.id)} 
//                     title="Delete"
//                   >
//                     <FaTrash />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Upload Modal */}
//       {showUploadModal && (
//         <div className="modal-overlay" onClick={() => {
//           if (!isLoading) setShowUploadModal(false);
//         }}>
//           <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <div className="modal-header-content">
//                 <h3><FaCloudUploadAlt /> Upload Document</h3>
//                 <p>Upload documents to improve your AI assistant's knowledge</p>
//               </div>
//               <button 
//                 className="close-btn" 
//                 onClick={() => {
//                   if (!isLoading) setShowUploadModal(false);
//                 }}
//                 disabled={isLoading}
//               >
//                 <FaTimes />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="upload-form">
//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Document Title <span className="required">*</span></label>
//                   <input
//                     type="text"
//                     name="title"
//                     value={formData.title}
//                     onChange={handleInputChange}
//                     placeholder="Enter document title"
//                     className="form-input"
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Category <span className="required">*</span></label>
//                   <select
//                     name="category"
//                     value={formData.category}
//                     onChange={handleInputChange}
//                     className="form-select"
//                     required
//                   >
//                     {categories.filter(c => c.value !== 'all').map(cat => (
//                       <option key={cat.value} value={cat.value}>
//                         {cat.icon} {cat.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   placeholder="Enter document description"
//                   className="form-textarea"
//                   rows="2"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Tags (comma-separated)</label>
//                 <input
//                   type="text"
//                   name="tags"
//                   value={formData.tags}
//                   onChange={handleInputChange}
//                   placeholder="e.g., support, pricing, faq"
//                   className="form-input"
//                 />
//               </div>

//               <div 
//                 className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'file-selected' : ''}`}
//                 onDragEnter={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDragOver={handleDrag}
//                 onDrop={handleDrop}
//               >
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleFileChange}
//                   className="file-input"
//                   accept=".pdf,.docx,.txt,.md"
//                 />
//                 {selectedFile ? (
//                   <div className="file-selected-info">
//                     <FaFileAlt className="selected-file-icon" />
//                     <div className="file-info">
//                       <span className="file-name">{selectedFile.name}</span>
//                       <span className="file-size">
//                         {(selectedFile.size / 1024).toFixed(1)} KB
//                       </span>
//                     </div>
//                     <button 
//                       type="button"
//                       className="remove-file"
//                       onClick={() => setSelectedFile(null)}
//                     >
//                       <FaTimes />
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="file-drop-content">
//                     <FaCloudUploadAlt className="upload-icon" />
//                     <span className="drop-text">Drag & drop your file here</span>
//                     <span className="drop-subtext">or click to browse</span>
//                     <span className="file-types">Supports: PDF, DOCX, TXT, MD (Max 10MB)</span>
//                   </div>
//                 )}
//               </div>

//               {isLoading && (
//                 <div className="upload-progress">
//                   <div className="progress-bar">
//                     <div 
//                       className="progress-fill" 
//                       style={{ width: `${uploadProgress}%` }}
//                     ></div>
//                   </div>
//                   <span className="progress-text">{uploadProgress}% uploaded</span>
//                 </div>
//               )}

//               <div className="form-actions">
//                 <button 
//                   type="button" 
//                   className="btn-secondary"
//                   onClick={() => {
//                     if (!isLoading) setShowUploadModal(false);
//                   }}
//                   disabled={isLoading}
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" 
//                   className="btn-primary upload-submit"
//                   disabled={isLoading || !selectedFile}
//                 >
//                   {isLoading ? (
//                     <>
//                       <FaSpinner className="spinner" /> Uploading...
//                     </>
//                   ) : (
//                     <>
//                       <FaUpload /> Upload Document
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentsPage;









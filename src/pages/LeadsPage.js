import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaPhone, 
  FaEnvelope, 
  FaUser, 
  FaTag, 
  FaEye,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaClock,
  FaCalendarAlt,
  FaWhatsapp,
  FaTelegram,
  FaGlobe,
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaChartLine,
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getLeads, updateLead, convertLead, addLeadNote } from '../services/api';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isMockData, setIsMockData] = useState(false);

  const statuses = [
    { value: 'all', label: 'All Status', icon: '📊' },
    { value: 'new', label: 'New', icon: '🆕' },
    { value: 'contacted', label: 'Contacted', icon: '📞' },
    { value: 'qualified', label: 'Qualified', icon: '⭐' },
    { value: 'converted', label: 'Converted', icon: '✅' },
    { value: 'lost', label: 'Lost', icon: '❌' },
  ];

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      const businessId = localStorage.getItem('businessId');
      
      if (!businessId) {
        console.warn('⚠️ No business ID found');
        setIsMockData(true);
        setLeads(getMockLeads());
        setLoading(false);
        return;
      }

      const response = await getLeads(businessId);
      
      console.log('📊 Leads response:', response);
      
      let leadsData = [];
      if (response.data && response.data.data) {
        leadsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        leadsData = response.data;
      }
      
      if (leadsData && leadsData.length > 0) {
        const formattedData = leadsData.map(lead => ({
          id: lead.id || lead._id,
          name: lead.name || 'Unknown',
          email: lead.email || '',
          phone: lead.phone || '',
          platform: lead.platform || 'web',
          status: lead.status || 'new',
          interest: lead.interest || 'Not specified',
          date: lead.created_at || lead.createdAt || new Date().toISOString(),
          notes: lead.notes || [],
          tags: lead.tags || [],
          source: lead.source || 'chat',
          convertedAt: lead.converted_at || lead.convertedAt,
          lastContactedAt: lead.last_contacted_at || lead.lastContactedAt,
        }));
        setIsMockData(false);
        setLeads(formattedData);
        toast.success(`Loaded ${formattedData.length} leads`);
      } else {
        setIsMockData(true);
        setLeads(getMockLeads());
        toast('No leads found. Start capturing leads from conversations.', {
          duration: 4000,
          icon: '💡',
        });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setIsMockData(true);
      setLeads(getMockLeads());
      toast('Could not connect to database. Showing demo leads.', {
        duration: 4000,
        icon: '⚠️',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'status-new';
      case 'contacted': return 'status-contacted';
      case 'qualified': return 'status-qualified';
      case 'converted': return 'status-converted';
      case 'lost': return 'status-lost';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'new': return <FaClock />;
      case 'contacted': return <FaPhone />;
      case 'qualified': return <FaCheck />;
      case 'converted': return <FaUserCheck />;
      case 'lost': return <FaTimes />;
      default: return <FaUser />;
    }
  };

  const getPlatformIcon = (platform) => {
    switch(platform?.toLowerCase()) {
      case 'whatsapp': return <FaWhatsapp className="platform-icon whatsapp" />;
      case 'telegram': return <FaTelegram className="platform-icon telegram" />;
      default: return <FaGlobe className="platform-icon web" />;
    }
  };

  const getStatusBadge = (status) => {
    const labels = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      converted: 'Converted',
      lost: 'Lost'
    };
    return labels[status] || status;
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      if (isMockData) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));
        toast.success(`Lead status updated to ${newStatus}`);
        return;
      }

      const response = await updateLead(leadId, { status: newStatus });
      if (response.data && response.data.success) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));
        toast.success(`Lead status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead status');
    }
  };

  const handleConvertLead = async (leadId) => {
    try {
      if (isMockData) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status: 'converted', convertedAt: new Date().toISOString() } : lead
        ));
        toast.success('🎉 Lead converted successfully!');
        return;
      }

      const response = await convertLead(leadId);
      if (response.data && response.data.success) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status: 'converted', convertedAt: new Date().toISOString() } : lead
        ));
        toast.success('🎉 Lead converted successfully!');
      }
    } catch (error) {
      console.error('Error converting lead:', error);
      toast.error('Failed to convert lead');
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || !selectedLead) return;

    try {
      if (isMockData) {
        const newNote = {
          content: noteContent,
          created_at: new Date().toISOString(),
          created_by: 'Admin'
        };
        setLeads(prev => prev.map(lead => 
          lead.id === selectedLead.id 
            ? { ...lead, notes: [...(lead.notes || []), newNote] } 
            : lead
        ));
        setSelectedLead(prev => ({
          ...prev,
          notes: [...(prev.notes || []), newNote]
        }));
        toast.success('Note added successfully');
        setNoteContent('');
        setShowNoteModal(false);
        return;
      }

      const response = await addLeadNote(selectedLead.id, { content: noteContent });
      if (response.data && response.data.success) {
        const newNote = {
          content: noteContent,
          created_at: new Date().toISOString(),
          created_by: 'Admin'
        };
        setLeads(prev => prev.map(lead => 
          lead.id === selectedLead.id 
            ? { ...lead, notes: [...(lead.notes || []), newNote] } 
            : lead
        ));
        setSelectedLead(prev => ({
          ...prev,
          notes: [...(prev.notes || []), newNote]
        }));
        toast.success('Note added successfully');
        setNoteContent('');
        setShowNoteModal(false);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm) ||
                         lead.interest?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const qualified = leads.filter(l => l.status === 'qualified').length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const lost = leads.filter(l => l.status === 'lost').length;
    return { total, newLeads, contacted, qualified, converted, lost };
  };

  const getMockLeads = () => {
    return [
      {
        id: 'mock-1',
        name: 'Alice Brown',
        email: 'alice@example.com',
        phone: '+1 234 567 8900',
        platform: 'whatsapp',
        status: 'new',
        interest: 'Pricing Plans',
        date: new Date().toISOString(),
        notes: [{ content: 'Interested in Pro plan', created_at: new Date().toISOString(), created_by: 'System' }],
        tags: ['pricing', 'interested'],
        source: 'chat'
      },
      {
        id: 'mock-2',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '+1 234 567 8901',
        platform: 'telegram',
        status: 'contacted',
        interest: 'Product Demo',
        date: new Date(Date.now() - 86400000).toISOString(),
        notes: [{ content: 'Scheduled demo for Tuesday', created_at: new Date().toISOString(), created_by: 'Admin' }],
        tags: ['demo', 'interested'],
        source: 'chat'
      },
      {
        id: 'mock-3',
        name: 'Carol Davis',
        email: 'carol@example.com',
        phone: '+1 234 567 8902',
        platform: 'web',
        status: 'qualified',
        interest: 'Enterprise Plan',
        date: new Date(Date.now() - 172800000).toISOString(),
        notes: [{ content: 'Enterprise ready, needs custom pricing', created_at: new Date().toISOString(), created_by: 'Admin' }],
        tags: ['enterprise', 'high-value'],
        source: 'form'
      },
      {
        id: 'mock-4',
        name: 'David Martinez',
        email: 'david@example.com',
        phone: '+1 234 567 8903',
        platform: 'telegram',
        status: 'converted',
        interest: 'Custom Solution',
        date: new Date(Date.now() - 259200000).toISOString(),
        notes: [{ content: 'Converted to customer!', created_at: new Date().toISOString(), created_by: 'Admin' }],
        tags: ['converted', 'custom'],
        source: 'chat',
        convertedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'mock-5',
        name: 'Emma White',
        email: 'emma@example.com',
        phone: '+1 234 567 8904',
        platform: 'whatsapp',
        status: 'lost',
        interest: 'Basic Plan',
        date: new Date(Date.now() - 345600000).toISOString(),
        notes: [{ content: 'Went with competitor', created_at: new Date().toISOString(), created_by: 'Admin' }],
        tags: ['lost', 'competitor'],
        source: 'chat'
      }
    ];
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

  if (loading) {
    return (
      <div className="leads-page">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading leads...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="leads-page">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">👤 Leads</h1>
          <p className="page-subtitle">Manage and track your leads from all channels</p>
          {isMockData && (
            <span className="demo-badge">🔹 Demo Mode</span>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => toast.info('Export feature coming soon')}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="leads-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Leads</span>
          </div>
        </div>
        <div className="stat-card new">
          <div className="stat-icon"><FaUserClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.newLeads}</span>
            <span className="stat-label">New</span>
          </div>
        </div>
        <div className="stat-card contacted">
          <div className="stat-icon"><FaPhone /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.contacted}</span>
            <span className="stat-label">Contacted</span>
          </div>
        </div>
        <div className="stat-card qualified">
          <div className="stat-icon"><FaCheck /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.qualified}</span>
            <span className="stat-label">Qualified</span>
          </div>
        </div>
        <div className="stat-card converted">
          <div className="stat-icon"><FaUserCheck /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.converted}</span>
            <span className="stat-label">Converted</span>
          </div>
        </div>
        <div className="stat-card lost">
          <div className="stat-icon"><FaUserTimes /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.lost}</span>
            <span className="stat-label">Lost</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="lead-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone, or interest..."
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

        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="leads-table-container">
        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>No leads found</h3>
            <p>Start capturing leads from conversations or import your existing leads</p>
          </div>
        ) : (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Platform</th>
                <th>Interest</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="lead-row">
                  <td>
                    <div className="lead-name">
                      <div className="lead-avatar">
                        <FaUser />
                      </div>
                      <div className="lead-info">
                        <span className="lead-name-text">{lead.name}</span>
                        {lead.tags && lead.tags.length > 0 && (
                          <div className="lead-tags">
                            {lead.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="lead-tag">#{tag}</span>
                            ))}
                            {lead.tags.length > 2 && (
                              <span className="lead-tag">+{lead.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="lead-contact">
                      {lead.email && <span className="contact-email">{lead.email}</span>}
                      {lead.phone && <span className="contact-phone">{lead.phone}</span>}
                    </div>
                  </td>
                  <td>
                    <span className="platform-badge">
                      {getPlatformIcon(lead.platform)}
                      {lead.platform || 'Web'}
                    </span>
                  </td>
                  <td>
                    <span className="interest-badge">{lead.interest}</span>
                  </td>
                  <td>
                    <div className="status-container">
                      <span className={`lead-status ${getStatusColor(lead.status)}`}>
                        {getStatusIcon(lead.status)} {getStatusBadge(lead.status)}
                      </span>
                      {lead.status !== 'converted' && lead.status !== 'lost' && (
                        <select
                          className="status-change"
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="lead-date">
                      <FaCalendarAlt className="date-icon" />
                      {formatDate(lead.date)}
                    </div>
                  </td>
                  <td>
                    <div className="lead-actions">
                      <button 
                        className="action-btn view" 
                        title="View Details"
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn note" 
                        title="Add Note"
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowNoteModal(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      {lead.status !== 'converted' && (
                        <button 
                          className="action-btn convert" 
                          title="Convert to Customer"
                          onClick={() => handleConvertLead(lead.id)}
                        >
                          <FaCheck />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lead Details Modal */}
      {showDetailsModal && selectedLead && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content lead-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3><FaUser /> Lead Details</h3>
                <p>{selectedLead.name}</p>
              </div>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="lead-details-content">
              <div className="details-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <span>{selectedLead.name}</span>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <span>{selectedLead.email || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  <span>{selectedLead.phone}</span>
                </div>
                <div className="detail-item">
                  <label>Platform</label>
                  <span>{selectedLead.platform}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`lead-status ${getStatusColor(selectedLead.status)}`}>
                    {getStatusIcon(selectedLead.status)} {getStatusBadge(selectedLead.status)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Interest</label>
                  <span>{selectedLead.interest}</span>
                </div>
                <div className="detail-item">
                  <label>Source</label>
                  <span>{selectedLead.source || 'Chat'}</span>
                </div>
                <div className="detail-item">
                  <label>Date</label>
                  <span>{formatDate(selectedLead.date)}</span>
                </div>
              </div>

              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <div className="detail-tags">
                  <label>Tags</label>
                  <div className="tags-list">
                    {selectedLead.tags.map((tag, i) => (
                      <span key={i} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-notes">
                <label>Notes</label>
                {selectedLead.notes && selectedLead.notes.length > 0 ? (
                  <div className="notes-list">
                    {selectedLead.notes.map((note, i) => (
                      <div key={i} className="note-item">
                        <div className="note-content">{note.content}</div>
                        <div className="note-meta">
                          <span>{formatDate(note.created_at)}</span>
                          <span>by {note.created_by || 'System'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-notes">No notes yet</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              {selectedLead.status !== 'converted' && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    handleConvertLead(selectedLead.id);
                    setShowDetailsModal(false);
                  }}
                >
                  <FaCheck /> Convert to Customer
                </button>
              )}
              <button 
                className="btn-secondary"
                onClick={() => {
                  setSelectedLead(selectedLead);
                  setShowDetailsModal(false);
                  setShowNoteModal(true);
                }}
              >
                <FaEdit /> Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedLead && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-content note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3><FaEdit /> Add Note</h3>
                <p>Add a note for {selectedLead.name}</p>
              </div>
              <button className="close-btn" onClick={() => setShowNoteModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="note-form">
              <div className="form-group">
                <label>Note Content</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter your note here..."
                  className="form-textarea"
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowNoteModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddNote}
                disabled={!noteContent.trim()}
              >
                <FaCheck /> Add Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
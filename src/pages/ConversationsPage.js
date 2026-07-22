import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaReply, 
  FaCheck, 
  FaFlag, 
  FaUser, 
  FaPaperPlane, 
  FaTelegram, 
  FaWhatsapp, 
  FaGlobe,
  FaSpinner,
  FaArrowLeft,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaTag,
  FaSmile,
  FaTimes,
  FaCheckDouble,
  FaExclamationTriangle,
  FaComments
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getConversations, getConversation, sendMessage, escalateConversation, resolveConversation } from '../services/api';
import websocketService from '../services/websocket';

const ConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isMockData, setIsMockData] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const selectedIdRef = useRef(null);

  const statuses = ['all', 'active', 'resolved', 'escalated', 'pending'];

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    
    websocketService.on('message-received', (data) => {
      handleNewMessage(data);
    });

    websocketService.on('conversation-updated', (data) => {
      fetchConversations();
    });

    websocketService.on('conversation-escalated', (data) => {
      toast.error(`⚠️ Conversation escalated: ${data.reason || 'Complex issue'}`, {
        duration: 4000,
        icon: '⚠️',
      });
      fetchConversations();
    });

    return () => {
      websocketService.off('message-received');
      websocketService.off('conversation-updated');
      websocketService.off('conversation-escalated');
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  // Typing indicator
  useEffect(() => {
    if (typing) {
      const timer = setTimeout(() => setTyping(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [typing]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      let businessId = localStorage.getItem('businessId');
      
      if (!businessId) {
        console.warn('⚠️ No business ID found in localStorage');
        setIsMockData(true);
        setConversations(getMockConversations());
        toast.error('Please login again to load your conversations.', {
          duration: 5000,
          icon: '⚠️',
        });
        setLoading(false);
        return;
      }
      
      console.log('📡 Fetching conversations for business:', businessId);
      
      const response = await getConversations(businessId);
      
      console.log('📊 API Response:', response);
      
      let conversationsData = [];
      if (response.data && response.data.data) {
        conversationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        conversationsData = response.data;
      }
      
      console.log('📊 Number of conversations:', conversationsData?.length || 0);
      
      if (conversationsData && conversationsData.length > 0) {
        const formattedData = conversationsData.map(conv => ({
          id: conv.id || conv._id,
          customerName: conv.customer_name || conv.customerName || 'Unknown',
          customerEmail: conv.customer_email || conv.customerEmail || '',
          customerPhone: conv.customer_phone || conv.customerPhone || '',
          platform: conv.platform || 'web',
          status: conv.status || 'active',
          lastMessage: conv.last_message || conv.lastMessage || 'No messages',
          lastMessageAt: conv.last_message_at || conv.lastMessageAt || conv.updated_at || conv.created_at || new Date().toISOString(),
          messages: conv.messages || [],
          sentiment: conv.sentiment || 'neutral',
          tags: conv.tags || [],
          escalated: conv.escalated || { isEscalated: false },
          lead: conv.lead || { isLead: false },
        }));
        
        console.log('📊 Formatted conversations:', formattedData);
        console.log('📊 First conversation messages:', formattedData[0]?.messages);
        
        setIsMockData(false);
        setConversations(formattedData);
        toast.success(`Loaded ${formattedData.length} conversations`);
      } else {
        console.log('⚠️ No conversations found in database');
        setIsMockData(true);
        setConversations(getMockConversations());
        toast('No conversations found. Create some conversations to get started.', {
          duration: 4000,
          icon: '💬',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      setIsMockData(true);
      setConversations(getMockConversations());
      toast('Could not connect to database. Showing demo conversations.', {
        duration: 4000,
        icon: '⚠️',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetails = useCallback(async (conversationId) => {
    if (!conversationId) {
      console.error('❌ No conversation ID provided');
      toast.error('Invalid conversation');
      return;
    }

    // Check if we already have this conversation loaded
    if (selectedIdRef.current === conversationId && selectedConversation) {
      console.log('ℹ️ Conversation already loaded:', conversationId);
      return;
    }

    console.log('📡 Fetching conversation details for ID:', conversationId);
    setLoadingDetails(true);

    // First check if we have the conversation in our list with messages
    const existingConv = conversations.find(c => c.id === conversationId);
    if (existingConv && existingConv.messages && existingConv.messages.length > 0) {
      console.log('📄 Using existing conversation with messages:', existingConv.messages.length);
      setSelectedConversation(existingConv);
      selectedIdRef.current = conversationId;
      websocketService.joinConversation(conversationId);
      setLoadingDetails(false);
      return;
    }

    // If we're using mock data, find in mock conversations
    if (isMockData) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        console.log('📄 Found conversation in mock data:', conv);
        console.log('📄 Mock messages:', conv.messages);
        setSelectedConversation(conv);
        selectedIdRef.current = conversationId;
      } else {
        console.error('❌ Conversation not found in mock data');
        toast.error('Conversation not found');
      }
      setLoadingDetails(false);
      return;
    }

    try {
      const response = await getConversation(conversationId);
      console.log('📊 Conversation details response:', response);
      
      if (response.data && response.data.data) {
        const conv = response.data.data;
        console.log('📄 Raw conversation data:', conv);
        console.log('📄 Messages from API:', conv.messages);
        
        // Format the conversation data
        const formattedConv = {
          id: conv.id || conv._id || conversationId,
          customerName: conv.customer_name || conv.customerName || 'Unknown',
          customerEmail: conv.customer_email || conv.customerEmail || '',
          customerPhone: conv.customer_phone || conv.customerPhone || '',
          platform: conv.platform || 'web',
          status: conv.status || 'active',
          lastMessage: conv.last_message || conv.lastMessage || 'No messages',
          lastMessageAt: conv.last_message_at || conv.lastMessageAt || conv.updated_at || conv.created_at || new Date().toISOString(),
          messages: conv.messages || [],
          sentiment: conv.sentiment || 'neutral',
          tags: conv.tags || [],
          escalated: conv.escalated || { isEscalated: false },
          lead: conv.lead || { isLead: false },
        };
        
        console.log('📄 Formatted conversation with messages:', formattedConv);
        console.log('📄 Messages count:', formattedConv.messages?.length || 0);
        
        setSelectedConversation(formattedConv);
        selectedIdRef.current = conversationId;
        websocketService.joinConversation(conversationId);
        
        // Update the conversation in the list
        setConversations(prev => 
          prev.map(c => c.id === conversationId ? formattedConv : c)
        );
      } else {
        console.error('❌ No conversation data in response');
        toast.error('Failed to load conversation');
      }
    } catch (error) {
      console.error('❌ Error fetching conversation details:', error);
      // Fallback to local conversation
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        console.log('📄 Using cached conversation:', conv);
        setSelectedConversation(conv);
        selectedIdRef.current = conversationId;
        toast('Using cached conversation data', {
          duration: 3000,
          icon: '📂',
        });
      } else {
        toast.error('Failed to load conversation details');
      }
    } finally {
      setLoadingDetails(false);
    }
  }, [conversations, isMockData, selectedConversation]);

  const handleNewMessage = useCallback((data) => {
    // Update conversation list
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === data.conversationId) {
          const newMessage = {
            sender: data.sender === 'assistant' ? 'AI' : 'Customer',
            content: data.message,
            time: new Date(data.timestamp).toLocaleTimeString(),
            timestamp: data.timestamp
          };
          return {
            ...conv,
            lastMessage: data.message,
            lastMessageAt: data.timestamp,
            messages: [...(conv.messages || []), newMessage]
          };
        }
        return conv;
      });
      return updated;
    });

    // Update selected conversation if open
    if (selectedConversation && selectedConversation.id === data.conversationId) {
      setSelectedConversation(prev => {
        if (!prev) return prev;
        const newMessage = {
          sender: data.sender === 'assistant' ? 'AI' : 'Customer',
          content: data.message,
          time: new Date(data.timestamp).toLocaleTimeString(),
          timestamp: data.timestamp
        };
        return {
          ...prev,
          messages: [...(prev.messages || []), newMessage],
          lastMessage: data.message,
          lastMessageAt: data.timestamp
        };
      });
    }
  }, [selectedConversation]);

  const handleSelectConversation = useCallback((conversation) => {
    console.log('🖱️ Selecting conversation:', conversation);
    
    if (!conversation || !conversation.id) {
      console.error('❌ Invalid conversation selected:', conversation);
      toast.error('Invalid conversation');
      return;
    }

    // Don't re-select the same conversation
    if (selectedIdRef.current === conversation.id) {
      console.log('ℹ️ Conversation already selected:', conversation.id);
      return;
    }

    if (selectedConversation) {
      websocketService.leaveConversation(selectedConversation.id);
    }
    
    // Set the selected conversation immediately
    setSelectedConversation(conversation);
    selectedIdRef.current = conversation.id;
    
    // Then fetch details
    fetchConversationDetails(conversation.id);
  }, [selectedConversation, fetchConversationDetails]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    if (isMockData) {
      const sentMessage = {
        sender: 'You',
        content: newMessage,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString()
      };

      setSelectedConversation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), sentMessage],
          lastMessage: newMessage,
          lastMessageAt: new Date().toISOString()
        };
      });

      setTimeout(() => {
        const aiMessage = {
          sender: 'AI',
          content: "Thank you for your message. I'll help you with that! 😊",
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().toISOString()
        };
        setSelectedConversation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...(prev.messages || []), aiMessage],
            lastMessage: aiMessage.content,
            lastMessageAt: new Date().toISOString()
          };
        });
        toast.success('AI response received (demo)');
      }, 1000);

      setNewMessage('');
      toast.success('Message sent (demo mode)');
      return;
    }

    setSending(true);
    try {
      const conversationId = selectedConversation.id;
      console.log('📤 Sending message to conversation:', conversationId);
      
      const response = await sendMessage(conversationId, newMessage);
      
      if (response.data && response.data.success) {
        const sentMessage = {
          sender: 'You',
          content: newMessage,
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().toISOString()
        };

        setSelectedConversation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...(prev.messages || []), sentMessage],
            lastMessage: newMessage,
            lastMessageAt: new Date().toISOString()
          };
        });

        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: newMessage,
                lastMessageAt: new Date().toISOString()
              };
            }
            return conv;
          });
          return updated;
        });

        setNewMessage('');
        toast.success('Message sent');
        websocketService.sendMessage(conversationId, newMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedConversation) return;
    
    if (isMockData) {
      toast('Escalation would happen here (demo mode)', {
        duration: 3000,
        icon: '🚀',
      });
      setSelectedConversation(prev => {
        if (!prev) return prev;
        return { ...prev, status: 'escalated' };
      });
      return;
    }

    try {
      const response = await escalateConversation(selectedConversation.id, {
        reason: 'Customer requested escalation'
      });
      
      if (response.data && response.data.success) {
        toast.success('Conversation escalated');
        fetchConversations();
        setSelectedConversation(response.data.data);
      }
    } catch (error) {
      console.error('Error escalating conversation:', error);
      toast.error('Failed to escalate conversation');
    }
  };

  const handleResolve = async () => {
    if (!selectedConversation) return;
    
    if (isMockData) {
      toast('Resolution would happen here (demo mode)', {
        duration: 3000,
        icon: '✅',
      });
      setSelectedConversation(prev => {
        if (!prev) return prev;
        return { ...prev, status: 'resolved' };
      });
      return;
    }

    try {
      const response = await resolveConversation(selectedConversation.id);
      
      if (response.data && response.data.success) {
        toast.success('Conversation resolved');
        fetchConversations();
        setSelectedConversation(response.data.data);
      }
    } catch (error) {
      console.error('Error resolving conversation:', error);
      toast.error('Failed to resolve conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPlatformIcon = (platform) => {
    switch(platform?.toLowerCase()) {
      case 'telegram': return <FaTelegram className="platform-icon telegram" />;
      case 'whatsapp': return <FaWhatsapp className="platform-icon whatsapp" />;
      default: return <FaGlobe className="platform-icon web" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'resolved': return 'status-resolved';
      case 'escalated': return 'status-escalated';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <FaClock />;
      case 'resolved': return <FaCheckDouble />;
      case 'escalated': return <FaExclamationTriangle />;
      case 'pending': return <FaClock />;
      default: return null;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getMockConversations = () => {
    return [
      {
        id: 'mock-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        platform: 'telegram',
        lastMessage: 'How do I reset my password?',
        lastMessageAt: new Date().toISOString(),
        status: 'active',
        messages: [
          { sender: 'John', content: 'Hi, I need help with my account', time: '10:30 AM', timestamp: new Date().toISOString() },
          { sender: 'AI', content: 'Hello! How can I help you today?', time: '10:31 AM', timestamp: new Date().toISOString() },
          { sender: 'John', content: 'How do I reset my password?', time: '10:32 AM', timestamp: new Date().toISOString() },
        ]
      },
      {
        id: 'mock-2',
        customerName: 'Sarah Smith',
        customerEmail: 'sarah@example.com',
        platform: 'whatsapp',
        lastMessage: 'Thank you for your help!',
        lastMessageAt: new Date(Date.now() - 900000).toISOString(),
        status: 'resolved',
        messages: [
          { sender: 'Sarah', content: 'I need information about your pricing', time: '09:15 AM', timestamp: new Date(Date.now() - 900000).toISOString() },
          { sender: 'AI', content: 'Here are our pricing plans...', time: '09:16 AM', timestamp: new Date(Date.now() - 890000).toISOString() },
          { sender: 'Sarah', content: 'Thank you for your help!', time: '09:20 AM', timestamp: new Date(Date.now() - 880000).toISOString() },
        ]
      },
      {
        id: 'mock-3',
        customerName: 'Mike Johnson',
        customerEmail: 'mike@example.com',
        platform: 'web',
        lastMessage: 'This is urgent!',
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'escalated',
        messages: [
          { sender: 'Mike', content: 'This is urgent!', time: '11:00 AM', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { sender: 'AI', content: "I'm escalating this to our support team", time: '11:01 AM', timestamp: new Date(Date.now() - 3590000).toISOString() },
        ]
      },
    ];
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="conversations-page">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversations-page">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">💬 Conversations</h1>
          <p className="page-subtitle">Manage all customer conversations in one place</p>
          {isMockData && (
            <span className="demo-badge">🔹 Demo Mode</span>
          )}
        </div>
        <div className="header-actions">
          <div className="conversation-stats">
            <span className="stat-badge">
              <span className="stat-dot active"></span>
              {conversations.filter(c => c.status === 'active').length} Active
            </span>
            <span className="stat-badge">
              <span className="stat-dot escalated"></span>
              {conversations.filter(c => c.status === 'escalated').length} Escalated
            </span>
            <span className="stat-badge">
              <span className="stat-dot resolved"></span>
              {conversations.filter(c => c.status === 'resolved').length} Resolved
            </span>
          </div>
        </div>
      </div>

      <div className="conversation-container">
        <div className="conversation-list">
          <div className="list-header">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
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
            <div className="filter-tabs">
              {statuses.map((status) => (
                <button
                  key={status}
                  className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="filter-count">
                      {conversations.filter(c => c.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="conversation-items">
            {filteredConversations.length === 0 ? (
              <div className="empty-state-small">
                <FaComments className="empty-icon" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const convId = conv.id;
                const isSelected = selectedConversation?.id === convId;
                return (
                  <div
                    key={convId}
                    className={`conversation-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="conv-avatar">
                      <FaUser />
                      <span className={`status-indicator ${conv.status}`}></span>
                    </div>
                    <div className="conv-info">
                      <div className="conv-header">
                        <span className="conv-name">{conv.customerName || 'Unknown'}</span>
                        <span className={`conv-status ${getStatusColor(conv.status)}`}>
                          {getStatusIcon(conv.status)} {conv.status}
                        </span>
                      </div>
                      <div className="conv-message">{conv.lastMessage || 'No messages'}</div>
                      <div className="conv-meta">
                        <span className="conv-platform">
                          {getPlatformIcon(conv.platform)}
                          {conv.platform || 'Web'}
                        </span>
                        <span className="conv-time">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="conversation-view">
          {selectedConversation ? (
            <>
              <div className="conversation-header">
                <div className="conv-user-info">
                  <button 
                    className="back-btn"
                    onClick={() => {
                      if (!isMockData && selectedConversation.id) {
                        websocketService.leaveConversation(selectedConversation.id);
                      }
                      setSelectedConversation(null);
                      selectedIdRef.current = null;
                    }}
                  >
                    <FaArrowLeft />
                  </button>
                  <div className="user-details">
                    <h3>{selectedConversation.customerName || 'Unknown'}</h3>
                    <div className="user-meta">
                      <span className="platform-badge">
                        {getPlatformIcon(selectedConversation.platform)}
                        {selectedConversation.platform || 'Web'}
                      </span>
                      {selectedConversation.customerEmail && (
                        <span className="email-badge">
                          <FaEnvelope /> {selectedConversation.customerEmail}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`conv-status ${getStatusColor(selectedConversation.status)}`}>
                    {getStatusIcon(selectedConversation.status)} {selectedConversation.status}
                  </span>
                </div>
                <div className="conv-actions">
                  <button 
                    className="action-btn resolve" 
                    onClick={handleResolve}
                    title="Resolve Conversation"
                    disabled={selectedConversation.status === 'resolved'}
                  >
                    <FaCheck /> Resolve
                  </button>
                  <button 
                    className="action-btn escalate" 
                    onClick={handleEscalate}
                    title="Escalate Conversation"
                    disabled={selectedConversation.status === 'escalated'}
                  >
                    <FaFlag /> Escalate
                  </button>
                </div>
              </div>

              <div className="messages-container">
                {loadingDetails ? (
                  <div className="loading-messages">
                    <FaSpinner className="spinner" />
                    <p>Loading messages...</p>
                  </div>
                ) : selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((msg, index) => {
                    // Handle different message formats
                    const sender = msg.sender || msg.role || 'User';
                    const content = msg.content || msg.message || '';
                    const time = msg.time || msg.timestamp || '';
                    const isAI = sender === 'AI' || sender === 'assistant' || msg.role === 'assistant';
                    
                    return (
                      <div 
                        key={index} 
                        className={`message ${isAI ? 'message-ai' : 'message-user'}`}
                      >
                        <div className="message-avatar">
                          {isAI ? '🤖' : '👤'}
                        </div>
                        <div className="message-bubble">
                          <div className="message-sender">{sender}</div>
                          <div className="message-content">{content}</div>
                          <div className="message-time">{time ? formatTime(time) : ''}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <FaComments className="empty-icon" />
                    <p>No messages yet</p>
                    <span>Start the conversation by sending a message</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                <form onSubmit={handleSendMessage} className="message-input-form">
                  <button 
                    type="button" 
                    className="emoji-btn"
                    onClick={() => setTyping(true)}
                  >
                    <FaSmile />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={isMockData ? "Type a message (demo mode)..." : "Type a message..."}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      setTyping(true);
                    }}
                    className="message-input"
                    disabled={sending || loadingDetails}
                  />
                  <button 
                    type="submit" 
                    className="send-btn"
                    disabled={!newMessage.trim() || sending || loadingDetails}
                  >
                    {sending ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
                  </button>
                </form>
                {typing && (
                  <div className="typing-indicator">
                    <span>Typing...</span>
                    <span className="typing-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  </div>
                )}
                {isMockData && (
                  <div className="demo-notice">
                    💡 Demo mode - Messages are not saved to the database
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state-large">
              <FaComments className="empty-icon-large" />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to view and reply to messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
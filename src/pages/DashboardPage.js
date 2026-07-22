import React, { useState, useEffect } from 'react';
import { FaUsers, FaComments, FaFileUpload, FaCog } from 'react-icons/fa';
import { getDashboardStats } from '../services/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalConversations: 1247,
    activeConversations: 23,
    totalDocuments: 156,
    totalLeads: 89,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use mock data if API fails
      setStats({
        totalConversations: 1247,
        activeConversations: 23,
        totalDocuments: 156,
        totalLeads: 89,
        recentActivities: [
          { time: '2 min ago', description: 'New lead captured from WhatsApp', status: 'success' },
          { time: '15 min ago', description: 'Document "FAQ v2" uploaded', status: 'info' },
          { time: '1 hour ago', description: 'Conversation escalated to support', status: 'warning' },
          { time: '3 hours ago', description: 'New customer inquiry via Telegram', status: 'success' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: <FaComments />, label: 'Total Conversations', value: stats.totalConversations, color: 'blue' },
    { icon: <FaUsers />, label: 'Active Chats', value: stats.activeConversations, color: 'green' },
    { icon: <FaFileUpload />, label: 'Documents', value: stats.totalDocuments, color: 'purple' },
    { icon: <FaCog />, label: 'Leads', value: stats.totalLeads, color: 'orange' },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-value">{loading ? '...' : stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {stats.recentActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-time">{activity.time}</span>
              <span className="activity-description">{activity.description}</span>
              <span className={`activity-status ${activity.status}`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;



import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaFileAlt, 
  FaComments, 
  FaUsers, 
  FaCog,
  FaRobot,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppContext();

  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/documents', icon: <FaFileAlt />, label: 'Documents' },
    { path: '/conversations', icon: <FaComments />, label: 'Conversations' },
    { path: '/leads', icon: <FaUsers />, label: 'Leads' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('businessId');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Call logout from context
    logout();
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <FaRobot className="logo-icon" />
        <h2>AI Support</h2>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar-wrapper">
            <FaUserCircle className="user-avatar-icon" />
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Demo Account'}</span>
            <span className="user-role">{user?.role || 'Admin'}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
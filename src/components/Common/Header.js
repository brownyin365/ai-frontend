import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import NotificationBell from './NotificationBell';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <h3>Welcome back, Admin</h3>
        <span className="header-subtitle">Here's what's happening with your business</span>
      </div>
      
      <div className="header-right">
        <NotificationBell />
        <div className="user-profile">
          <FaUserCircle className="user-avatar" />
          <span className="user-name">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
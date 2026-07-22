import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import websocketService from '../../services/websocket';

const NotificationBell = () => {
  const { notifications, unreadCount, markNotificationsRead, addNotification } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for new notifications
    websocketService.on('notification', (data) => {
      addNotification({
        id: Date.now(),
        message: data.message,
        type: data.type,
        timestamp: new Date(),
        read: false,
      });
    });

    return () => {
      websocketService.off('notification');
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      markNotificationsRead();
    }
  };

  return (
    <div className="notification-wrapper">
      <button className="notification-btn" onClick={toggleDropdown}>
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            <button className="mark-all-read" onClick={markNotificationsRead}>
              Mark all as read
            </button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
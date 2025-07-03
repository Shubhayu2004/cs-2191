import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserDataContext';

const NotificationList = () => {
  const { user } = useContext(UserDataContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setNotifications(res.data || []);
      } catch (err) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchNotifications();
  }, [user]);

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (!user?._id) return null;
  if (loading) return <div>Loading notifications...</div>;
  if (notifications.length === 0) return <div>No notifications.</div>;

  return (
    <div className="notification-list">
      <h4>Notifications</h4>
      <ul>
        {notifications.map((n) => (
          <li key={n._id} style={{ cursor: n.link ? 'pointer' : 'default', background: n.isRead ? '#eee' : '#ccefff' }} onClick={() => handleNotificationClick(n)}>
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;

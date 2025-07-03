import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserDataContext';

import styles from '../styles/home.module.css';

const Home = () => {
  const { user } = useContext(UserDataContext); // Fetch user data from context
  const [notifications, setNotifications] = useState([]);
  const [showNotis, setShowNotis] = useState(false);
  // Removed userCommittees, errorMessage, loading state as 'Your Committees' section is removed

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token'); // Fetch token from localStorage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = () => {
    setShowNotis(!showNotis);
    // Optionally, mark all as read here
  };
  const [notifications, setNotifications] = useState(5); // Initial notification count
  const [showNotis, setShowNotis] = useState(false);
  const handleClick = () => {
    setNotifications(0);
    setShowNotis(true);
  };

  // Removed useEffect for fetching user committees as 'Your Committees' section is removed

  return (
    <div>
      {/* Header Section */}
      <header className={styles.pageHeader}>
        <h1>
          Meeting <br />
          Management Workspace
        </h1>
      </header>

      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h1>
            Meeting <br />
            Manager
          </h1>
          <nav className={styles.menu}>
            <Link to="/home" className={styles.menuItem}>
              Home
            </Link>
            <Link to="/committee" className={styles.menuItem}>
              Committee
            </Link>
            <Link to="/user/logout" className={styles.menuItem}>
              Logout
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className={styles.homeContent}>
          <div className={styles.top}>
            {/* Profile Section */}
            <div className={styles.pfp}>
              <img
                src="https://static.vecteezy.com/system/resources/previews/036/280/650/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
                alt="Profile"
              />
            </div>
            <div className={styles.person}>
              <p>
                <i className="fas fa-user"></i> Name: {user?.fullname?.firstname || 'Guest'}{' '}
                {user?.fullname?.lastname || ''}
              </p>
              <p>
                <i className="fas fa-envelope"></i> User ID: {user?.email || 'N/A'}
              </p>
              {user?.status === 'admin' && (
                <p>
                  <i className="fas fa-envelope"></i> Status: {user.status}
                </p>
              )}
            </div>

            {/* Notifications Section */}
            <div className={styles.noti}>
              <button onClick={handleNotificationClick}>
                <img src="/assets/noti.png" alt="Notifications" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className={styles.notiCount}>{notifications.filter(n => !n.isRead).length}</span>
                )}
              </button>
            </div>
          </div>

          {/* Notifications */}

          {showNotis && (
            <section className={styles.notifications}>
              <button
                type="button"
                className={styles.closebtn}
                onClick={() => setShowNotis(false)}
              >
                x
              </button>
              <h2>Notifications</h2>
              <ul>
                {notifications.length === 0 && <li>No notifications.</li>}
                {notifications.map((noti) => (
                  <li key={noti._id} style={{ fontWeight: noti.isRead ? 'normal' : 'bold' }}>
                    {noti.link ? (
                      <Link
                        to={noti.link}
                        onClick={async () => {
                          if (!noti.isRead) {
                            try {
                              const token = localStorage.getItem('token');
                              await axios.put(`${import.meta.env.VITE_BASE_URL}/api/notifications/${noti._id}/read`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              setNotifications((prev) => prev.map(n => n._id === noti._id ? { ...n, isRead: true } : n));
                            } catch {
                              // Optionally handle error
                            }
                          }
                        }}
                      >
                        {noti.message}
                      </Link>
                    ) : (
                      noti.message
                    )}
                    <span style={{ marginLeft: 8, fontSize: 10, color: '#888' }}>{new Date(noti.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* User's Committees section removed as requested */}
        </div>
      </div>
    </div>
  );
};

export default Home;

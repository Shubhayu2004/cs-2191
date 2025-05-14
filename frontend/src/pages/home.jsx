import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import styles from '../styles/home.module.css';
import axios from 'axios';

const Home = () => {
  const { user } = useContext(UserDataContext);
  const [realNotifications, setRealNotifications] = useState([]);
  const [showNotis, setShowNotis] = useState(false);
  const [loadingNotis, setLoadingNotis] = useState(false);
  const [errorNotis, setErrorNotis] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoadingNotis(true);
    setErrorNotis(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRealNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setErrorNotis(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoadingNotis(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async () => {
    if (!showNotis) {
      const unreadNotifications = realNotifications.filter(n => !n.isRead);
      if (unreadNotifications.length > 0) {
        const notifIdsToMarkRead = unreadNotifications.map(n => n._id);
        try {
          const token = localStorage.getItem("token");
          await axios.put(
            `${import.meta.env.VITE_BASE_URL}/api/notifications/read`,
            { notificationIds: notifIdsToMarkRead },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            }
          );
          setRealNotifications(prevNotis => 
            prevNotis.map(n => 
              notifIdsToMarkRead.includes(n._id) ? { ...n, isRead: true } : n
            )
          );
        } catch (err) {
          console.error("Error marking notifications as read:", err);
        }
      }
    }
    setShowNotis(!showNotis);
  };
  
  const handleNotificationItemClick = (committeeId) => {
    if (committeeId) {
      setShowNotis(false);
      navigate(`/committeeDashboard/${committeeId}`);
    }
  };
  
  const unreadNotificationCount = realNotifications.filter(n => !n.isRead).length;

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
                <i className="fas fa-user"></i> Name: {user?.fullname?.firstname}{' '}
                {user?.fullname?.lastname || ''}
              </p>
              <p>
                <i className="fas fa-envelope"></i> User ID: {user?.email || 'N/A'}
              </p>
              <p>
                <i className="fas fa-envelope"></i> Status: {user?.status || 'N/A'}
              </p>
            </div>

            {/* Notifications Section */}
            <div className={styles.noti}>
              <button onClick={handleNotificationClick}>
                <img src="/assets/noti.png" alt="Notifications" />
                {unreadNotificationCount > 0 && (
                  <span className={styles.notiCount}>{unreadNotificationCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Display Notifications if triggered */}
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
              {loadingNotis && <p>Loading notifications...</p>}
              {errorNotis && <p style={{ color: 'red' }}>{errorNotis}</p>}
              {!loadingNotis && !errorNotis && realNotifications.length === 0 && (
                <p>No new notifications.</p>
              )}
              {!loadingNotis && !errorNotis && realNotifications.length > 0 && (
                <ul>
                  {realNotifications.map(notif => (
                    <li 
                      key={notif._id} 
                      style={{ 
                        fontWeight: notif.isRead ? 'normal' : 'bold',
                        cursor: notif.committeeId ? 'pointer' : 'default',
                        padding: '10px',
                        margin: '5px 0',
                        borderRadius: '4px',
                        backgroundColor: notif.isRead ? '#f5f5f5' : '#e3f2fd',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => handleNotificationItemClick(notif.committeeId)}
                      onMouseOver={(e) => {
                        if (notif.committeeId) {
                          e.currentTarget.style.backgroundColor = notif.isRead ? '#e0e0e0' : '#bbdefb';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (notif.committeeId) {
                          e.currentTarget.style.backgroundColor = notif.isRead ? '#f5f5f5' : '#e3f2fd';
                        }
                      }}
                    >
                      {notif.message}
                      <br />
                      <small style={{ color: '#666' }}>
                        {new Date(notif.timestamp).toLocaleString()}
                      </small>
                      {notif.committeeId && (
                        <small style={{ 
                          display: 'block', 
                          color: '#1976d2',
                          marginTop: '5px'
                        }}>
                          Click to view committee →
                        </small>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

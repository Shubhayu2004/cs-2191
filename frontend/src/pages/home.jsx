import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserDataContext';
import styles from '../styles/home.module.css';

const Home = () => {
  const { user } = useContext(UserDataContext); // Fetch user data from context
  const [notifications, setNotifications] = useState([]);
  const [showNotis, setShowNotis] = useState(false);
  const [userCommittees, setUserCommittees] = useState([]); // State to store user's committees
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

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

  // Fetch committees from API
  useEffect(() => {
    const fetchUserCommittees = async () => {
      try {
        const token = localStorage.getItem('token'); // Fetch token from localStorage
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/committees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Filter committees where the user is a member based on email
        const userEmail = user?.email; 
        if (!userEmail) {
          setErrorMessage('User email is not available.');
          return;
        }

        const filteredCommittees = response.data.filter((committee) => 
          committee.chairman?.email === userEmail ||
          committee.convener?.email === userEmail ||
          committee.members.some((member) => member.email === userEmail)
        );

        setUserCommittees(filteredCommittees);
      } catch (error) {
        console.error('Failed to fetch committees:', error);
        setErrorMessage('Failed to load committees. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCommittees();
  }, [user]);

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

          {/* User's Committees */}
          <section className={styles.yourCommittee}>
            <h2>Your Committees</h2>
            {loading ? (
              <p>Loading committees...</p>
            ) : errorMessage ? (
              <p>{errorMessage}</p>
            ) : userCommittees.length > 0 ? (
              <ul>
                {userCommittees.map((committee) => (
                  <li key={committee._id}>
                    {committee.committeeName || 'Unnamed Committee'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>You are not part of any committees yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;

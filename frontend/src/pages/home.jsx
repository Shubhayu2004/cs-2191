import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';
import styles from '../styles/home.module.css';

const Home = () => {
  const { user } = useContext(UserDataContext); // Fetch user data from context
  const [notifications, setNotifications] = useState(5);
  const [showNotis, setShowNotis] = useState(false);
  const [userCommittees, setUserCommittees] = useState([]); // State to store user's committees
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const handleNotificationClick = () => {
    setNotifications(0);
    setShowNotis(!showNotis);
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

        // Filter committees where the user is a member
        const userId = user ? user.id || user._id : null; // Assuming user.id or user._id identifies the user
        const filteredCommittees = response.data.filter((committee) =>
          committee.chairman?._id === userId ||
          committee.convener?._id === userId ||
          committee.members.some((member) => member._id === userId)
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
              <p>
                <i className="fas fa-envelope"></i> Status: {user?.status || 'N/A'}
              </p>
            </div>

            {/* Notifications Section */}
            <div className={styles.noti}>
              <button onClick={handleNotificationClick}>
                <img src="/assets/noti.png" alt="Notifications" />
                {notifications > 0 && (
                  <span className={styles.notiCount}>{notifications}</span>
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
                {/* Replace this with dynamic notifications if needed */}
                <li>XYZ invited you to a meeting on 4th Feb at 3:40 pm</li>
                <li>ABC invited you to a meeting on 10th Feb at 2:15 pm</li>
                <li>DEF invited you to a meeting on 12th Feb at 11:00 am</li>
                <li>GHI invited you to a meeting on 15th Feb at 4:45 pm</li>
                <li>JKL invited you to a meeting on 18th Feb at 9:30 am</li>
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

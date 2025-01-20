import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { UserDataContext } from '../context/UserContext';


import styles from '../styles/home.module.css';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useContext(UserDataContext);
  const toggleMenu = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const [notifications, setNotifications] = useState(5); // Initial notification count
  const [showNotis, setShowNotis] = useState(false);
  const handleClick = () => {
    setNotifications(0);
    setShowNotis(true);
  };

  return (
    <div className={styles.home}>
      {/* Sidebar Menu */}
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          <Link to="/">Home</Link>
          <Link to="/committee">Committee</Link>
          <Link to="/user/logout">Logout</Link>
        </div>
      </div>

      {/* Hamburger Icon */}
      <div
        className={`${styles.hamburger} ${isSidebarOpen ? styles.open : ''}`}
        onClick={toggleMenu}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Main Content */}
      <div className={styles.homeContent}>
        <h2 className={styles.homeHead}>Meeting Management Automation Workspace</h2>
        <div className={styles.top}>
          <div className={styles.pfp}>
            <img
              src="https://static.vecteezy.com/system/resources/previews/036/280/650/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
              alt="Profile"
            />
          </div>
          <div className={styles.person}>
            <p>
              <i className="fas fa-user"></i> Name:{' '}
              {user?.fullname?.firstname} {user?.fullname?.lastname || ''}
            </p>
            <p>
              <i className="fas fa-envelope"></i> User ID: {user?.email || 'N/A'}
            </p>
            <p>
              <i className={styles.fas_fa_briefcase}></i> Role: Head Of the Department, CST
            </p>
          </div>
          {/* <div className={styles.logo}>
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/IIEST_Shibpur_Logo.svg/1200px-IIEST_Shibpur_Logo.svg.png"
              alt="Logo"
            />
          </div> */}
          <div className={styles.noti}>
            <button onClick={handleClick}>
              <img src="/assets/noti.png" alt="Notifications" />
              {notifications > 0 && (
                <span className={styles.notiCount}>
                  {notifications}
                </span>
              )}
            </button>
          </div>
          {showNotis && (
            <section className={styles.notifications}>
              <button
                type="button"
                className={styles.closebtn}
                onClick={() => setShowNotis(false)}
              >
                x
              </button>



              <h2 >Notifications</h2>
              <ul>
                <li>XYZ invited you to a meeting on 4th Feb at 3:40 pm</li>
                <li>ABC invited you to a meeting on 10th Feb at 2:15 pm</li>
                <li>DEF invited you to a meeting on 12th Feb at 11:00 am</li>
                <li>GHI invited you to a meeting on 15th Feb at 4:45 pm</li>
                <li>JKL invited you to a meeting on 18th Feb at 9:30 am</li>
                {/* <tbody id="upcoming-meetings-tbody">
                  {populateUpcomingMeetings()}
                </tbody> */}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div >
  );
};

export default Home;

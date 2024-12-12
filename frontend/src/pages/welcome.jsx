
import React from 'react';
import '../styles/WelcomePage.css';
function WelcomePage() {
  return (
    <div className="welcome-container">
      <h1>Welcome to Our Website!</h1>
      <p>We're glad you're here. Enjoy browsing!</p>
      <div className="login-button">
      
        <a href="/Login">Login</a>
      </div>
      <div className="register-button">
        <a href="/Register">Register</a>
      </div>
    </div>




  );
}

export default WelcomePage;

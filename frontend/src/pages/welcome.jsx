import React from "react";
import { useState, useEffect } from "react";
import styles from "../styles/welcome.module.css";


function Landing() {


  return (
    <div className={styles.landing}>
      <div className={styles.left}>
        <h2 className={styles.name}>MeetSync</h2>

        <div className={styles.description}>
          <div className={styles.welcome}>Welcome to  <span className={styles.name2}>MeetSync <br /></span></div>

          <div>Dynamic Meeting Management Workspace</div>
          <div className={styles.slogan}>Organize ● Sync ● Excel</div>
        </div>
      </div>
      <div className={styles.right}>

        <nav className={styles.navbar}>
          <a href="/Login" className={styles.login}>Login</a>
          <a href="/Register" className={styles.signup}>Sign Up</a>
        </nav>
        <img className={styles.logo} src="/assets/IIESTShibpur_Logo.png" alt="Logo" />
      </div>

    </div>
  )
}

export default Landing;
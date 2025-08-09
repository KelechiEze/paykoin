import React from "react";
import styles from "./Preloader.module.css";

const Preloader: React.FC = () => {
  return (
    <main
      className={styles.funnyPreloaderPage}
      role="main"
      aria-labelledby="funny-main-heading"
    >
      <h1
        id="funny-main-heading"
        className={styles.funnyBlinkHeading}
        aria-label="P"
      >
        P
      </h1>
      <div className={styles.funnyLoader} aria-hidden="true" />
    </main>
  );
};

export default Preloader;

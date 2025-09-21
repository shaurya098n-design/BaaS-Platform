'use client'

import styles from './Hero.module.css'

interface HeroProps {
  onShowLogin: () => void
  onShowRegister: () => void
}

export default function Hero({ onShowLogin, onShowRegister }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1>Build Full-Stack Apps in Minutes</h1>
        <p>Upload your frontend, get a complete backend automatically. No coding required.</p>
        <div className={styles.heroButtons}>
          <button className={styles.btnHero} onClick={onShowRegister}>
            <i className="fas fa-upload"></i> Start Building
          </button>
          <button className={`${styles.btnHero} ${styles.secondary}`} onClick={onShowLogin}>
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
        </div>
      </div>
    </section>
  )
}


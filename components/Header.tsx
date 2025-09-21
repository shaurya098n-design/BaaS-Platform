'use client'

import { useState, useEffect } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  currentUser: any
  onLogout: () => void
  showAuthButtons: boolean
  onShowLogin?: () => void
  onShowRegister?: () => void
}

export default function Header({ 
  currentUser, 
  onLogout, 
  showAuthButtons, 
  onShowLogin, 
  onShowRegister 
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <a href="#" className={styles.logo}>
            <i className="fas fa-rocket"></i> BaaS Platform
          </a>
          
          <ul className={styles.navLinks}>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#docs">Docs</a></li>
          </ul>
          
          {showAuthButtons ? (
            <div className={styles.authButtons}>
              <button className={styles.btnOutline} onClick={onShowLogin}>
                Login
              </button>
              <button className={styles.btnPrimary} onClick={onShowRegister}>
                Get Started
              </button>
            </div>
          ) : (
            <div className={styles.userMenu}>
              <span>{currentUser?.email || 'User'}</span>
              <button className={styles.btnOutline} onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}


'use client'

import { useState, useEffect } from 'react'
import GitHubStatus from './GitHubStatus'
import styles from './Sidebar.module.css'

interface SidebarProps {
  projects: any[]
  githubStatus?: any
  currentUser?: any
  onGitHubStatusChange?: () => void
}

export default function Sidebar({ projects, githubStatus, currentUser, onGitHubStatusChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState('overview')

  useEffect(() => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true'
    setCollapsed(isCollapsed)
  }, [])

  const toggleSidebar = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString())
  }

  const handleNavClick = (navItem: string) => {
    setActiveNav(navItem)
  }

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    apis: projects.reduce((sum, p) => sum + (p.api_count || 0), 0),
    users: projects.reduce((sum, p) => sum + (p.user_count || 0), 0)
  }

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>
          <i className="fas fa-terminal"></i> Dev Console
        </h3>
        <button className={styles.sidebarToggle} onClick={toggleSidebar}>
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        <a 
          href="#" 
          className={`${styles.navItem} ${activeNav === 'overview' ? styles.active : ''}`} 
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('overview')
          }}
        >
          <i className="fas fa-desktop"></i>
          <span>Dashboard</span>
        </a>
        <a 
          href="#" 
          className={`${styles.navItem} ${activeNav === 'projects' ? styles.active : ''}`} 
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('projects')
          }}
        >
          <i className="fas fa-code-branch"></i>
          <span>Repositories</span>
        </a>
        <a 
          href="#" 
          className={`${styles.navItem} ${activeNav === 'analytics' ? styles.active : ''}`} 
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('analytics')
          }}
        >
          <i className="fas fa-chart-bar"></i>
          <span>Metrics</span>
        </a>
        <a 
          href="#" 
          className={`${styles.navItem} ${activeNav === 'settings' ? styles.active : ''}`} 
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('settings')
          }}
        >
          <i className="fas fa-sliders-h"></i>
          <span>Config</span>
        </a>
      </nav>

      <div className={styles.githubSection}>
        <GitHubStatus 
          status={githubStatus || { connected: false, username: '' }} 
          onStatusChange={onGitHubStatusChange}
          compact={true}
          collapsed={collapsed}
        />
      </div>

      <div className={styles.sidebarStats}>
        <h4 className={styles.sidebarStatsTitle}>
          <i className="fas fa-chart-line"></i> Dev Metrics
        </h4>
        <div className={styles.sidebarStat}>
          <span className={styles.sidebarStatLabel}>
            <i className="fas fa-code-branch"></i> Repos
          </span>
          <span className={styles.sidebarStatValue}>{stats.total}</span>
        </div>
        <div className={styles.sidebarStat}>
          <span className={styles.sidebarStatLabel}>
            <i className="fas fa-play-circle"></i> Active
          </span>
          <span className={styles.sidebarStatValue}>{stats.active}</span>
        </div>
        <div className={styles.sidebarStat}>
          <span className={styles.sidebarStatLabel}>
            <i className="fas fa-plug"></i> APIs
          </span>
          <span className={styles.sidebarStatValue}>{stats.apis}</span>
        </div>
        <div className={styles.sidebarStat}>
          <span className={styles.sidebarStatLabel}>
            <i className="fas fa-users"></i> Users
          </span>
          <span className={styles.sidebarStatValue}>{stats.users}</span>
        </div>
      </div>

      {currentUser && (
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <i className="fas fa-user-ninja"></i>
          </div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>
              {currentUser.email?.split('@')[0] || 'User'}
            </div>
            <div className={styles.userEmail}>
              {currentUser.email}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


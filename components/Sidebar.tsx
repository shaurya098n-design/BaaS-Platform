'use client'

import { useState, useEffect } from 'react'
import GitHubStatus from './GitHubStatus'
import styles from './Sidebar.module.css'

interface SidebarProps {
  projects: any[]
  githubStatus?: any
  onGitHubStatusChange?: () => void
}

export default function Sidebar({ projects, githubStatus, onGitHubStatusChange }: SidebarProps) {
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
        <h3 className={styles.sidebarTitle}>Dashboard</h3>
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
          <i className="fas fa-home"></i>
          <span>Overview</span>
        </a>
        <a 
          href="#" 
          className={`${styles.navItem} ${activeNav === 'projects' ? styles.active : ''}`} 
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('projects')
          }}
        >
          <i className="fas fa-folder"></i>
          <span>Projects</span>
        </a>
        <a 
          href="#" 
          className={`${styles.navItem} ${activeNav === 'analytics' ? styles.active : ''}`} 
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('analytics')
          }}
        >
          <i className="fas fa-chart-line"></i>
          <span>Analytics</span>
        </a>
        <a 
          href="#" 
          className={`${styles.navItem} ${activeNav === 'settings' ? styles.active : ''}`} 
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('settings')
          }}
        >
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </a>
      </nav>

      <div className={styles.githubSection}>
        <GitHubStatus 
          status={githubStatus || { connected: false }} 
          onStatusChange={onGitHubStatusChange}
          compact={true}
        />
      </div>

      <div className={styles.sidebarStats}>
        <h4 className={styles.sidebarStatsTitle}>Quick Stats</h4>
        <div className={styles.sidebarStat}>
          <span className={styles.sidebarStatLabel}>Projects</span>
          <span className={styles.sidebarStatValue}>{stats.total}</span>
        </div>
        <div className={styles.sidebarStat}>
          <span className={styles.sidebarStatLabel}>Active</span>
          <span className={styles.sidebarStatValue}>{stats.active}</span>
        </div>
        <div className={styles.sidebarStat}>
          <span className={styles.sidebarStatLabel}>APIs</span>
          <span className={styles.sidebarStatValue}>{stats.apis}</span>
        </div>
        <div className={styles.sidebarStat}>
          <span className={styles.sidebarStatLabel}>Users</span>
          <span className={styles.sidebarStatValue}>{stats.users}</span>
        </div>
      </div>
    </div>
  )
}


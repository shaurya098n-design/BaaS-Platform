'use client'

import styles from './GitHubStatus.module.css'

interface GitHubStatusProps {
  status: any
  onStatusChange: () => void
  compact?: boolean
  collapsed?: boolean
}

export default function GitHubStatus({ status, onStatusChange, compact = false, collapsed = false }: GitHubStatusProps) {
  // Defensive programming - ensure status is never null/undefined
  const safeStatus = status || { connected: false, username: '' }
  
  const connectGitHub = () => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      alert('Please login first to connect GitHub.')
      return
    }
    window.location.href = `/api/auth/github?token=${encodeURIComponent(authToken)}`
  }

  if (compact) {
    console.log('GitHubStatus compact mode - status:', safeStatus)
    
    // Ultra-compact version for collapsed sidebar
    if (collapsed) {
      return (
        <div className={styles.githubCompactCollapsed}>
          <button 
            className={styles.githubCompactCollapsedBtn}
            onClick={safeStatus.connected ? () => window.open(`https://github.com/${safeStatus.username}`, '_blank') : connectGitHub}
            title={safeStatus.connected ? 'View GitHub Profile' : 'Connect GitHub'}
          >
            <i className="fab fa-github"></i>
          </button>
        </div>
      )
    }
    
    // Normal compact version for expanded sidebar
    return (
      <div className={styles.githubCompact}>
        <div className={styles.githubCompactHeader}>
          <div className={styles.githubIcon}>
            <i className="fab fa-github"></i>
          </div>
          <div className={styles.githubCompactInfo}>
            <span className={styles.githubStatus}>
              {safeStatus.connected ? 'Connected' : 'Not Connected'}
            </span>
            {safeStatus.connected && (
              <span className={styles.githubUsername}>@{safeStatus.username}</span>
            )}
          </div>
        </div>
        <button 
          className={styles.githubCompactBtn}
          onClick={safeStatus.connected ? () => window.open(`https://github.com/${safeStatus.username}`, '_blank') : connectGitHub}
          title={safeStatus.connected ? 'View GitHub Profile' : 'Connect GitHub'}
        >
          <i className={`fas fa-${safeStatus.connected ? 'external-link-alt' : 'link'}`}></i>
        </button>
      </div>
    )
  }

  return (
    <div className={styles.githubSection}>
      <div className={`${styles.githubStatusCard} ${safeStatus.connected ? styles.connected : ''}`}>
        <div className={styles.githubInfo}>
          <i className="fab fa-github"></i>
          <div className={styles.githubDetails}>
            <h3>{safeStatus.connected ? 'GitHub Connected' : 'Connect GitHub'}</h3>
            <p>
              {safeStatus.connected 
                ? `Connected as @${safeStatus.username}` 
                : 'Connect your GitHub account to deploy projects to your repositories'
              }
            </p>
          </div>
        </div>
        <button 
          className={safeStatus.connected ? styles.githubConnectedBtn : styles.githubConnectBtn}
          onClick={safeStatus.connected ? () => window.open(`https://github.com/${safeStatus.username}`, '_blank') : connectGitHub}
        >
          <i className="fab fa-github"></i>
          {safeStatus.connected ? 'View Profile' : 'Connect GitHub'}
        </button>
      </div>
    </div>
  )
}


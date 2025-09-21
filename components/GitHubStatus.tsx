'use client'

import styles from './GitHubStatus.module.css'

interface GitHubStatusProps {
  status: any
  onStatusChange: () => void
  compact?: boolean
}

export default function GitHubStatus({ status, onStatusChange, compact = false }: GitHubStatusProps) {
  const connectGitHub = () => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      alert('Please login first to connect GitHub.')
      return
    }
    window.location.href = `/api/auth/github?token=${encodeURIComponent(authToken)}`
  }

  if (compact) {
    console.log('GitHubStatus compact mode - status:', status)
    return (
      <div className={styles.githubCompact}>
        <div className={styles.githubCompactHeader}>
          <div className={styles.githubIcon}>
            <i className="fab fa-github"></i>
          </div>
          <div className={styles.githubCompactInfo}>
            <span className={styles.githubStatus}>
              {status.connected ? 'Connected' : 'Not Connected'}
            </span>
            {status.connected && (
              <span className={styles.githubUsername}>@{status.username}</span>
            )}
          </div>
        </div>
        <button 
          className={styles.githubCompactBtn}
          onClick={status.connected ? () => window.open(`https://github.com/${status.username}`, '_blank') : connectGitHub}
          title={status.connected ? 'View GitHub Profile' : 'Connect GitHub'}
        >
          <i className={`fas fa-${status.connected ? 'external-link-alt' : 'link'}`}></i>
        </button>
      </div>
    )
  }

  return (
    <div className={styles.githubSection}>
      <div className={`${styles.githubStatusCard} ${status.connected ? styles.connected : ''}`}>
        <div className={styles.githubInfo}>
          <i className="fab fa-github"></i>
          <div className={styles.githubDetails}>
            <h3>{status.connected ? 'GitHub Connected' : 'Connect GitHub'}</h3>
            <p>
              {status.connected 
                ? `Connected as @${status.username}` 
                : 'Connect your GitHub account to deploy projects to your repositories'
              }
            </p>
          </div>
        </div>
        <button 
          className={status.connected ? styles.githubConnectedBtn : styles.githubConnectBtn}
          onClick={status.connected ? () => window.open(`https://github.com/${status.username}`, '_blank') : connectGitHub}
        >
          <i className="fab fa-github"></i>
          {status.connected ? 'View Profile' : 'Connect GitHub'}
        </button>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import ProjectsGrid from './ProjectsGrid'
import styles from './DashboardMain.module.css'

interface DashboardMainProps {
  projects: any[]
  onShowUploadModal: () => void
  onDeleteProject: (projectId: string) => void
}

export default function DashboardMain({ 
  projects, 
  onShowUploadModal, 
  onDeleteProject 
}: DashboardMainProps) {

  const showTemplates = () => {
    alert('Templates feature coming soon!')
  }

  const showAnalytics = () => {
    alert('Analytics feature coming soon!')
  }

  return (
    <div className={styles.dashboardMain}>
      <div className={styles.dashboardHeader}>
        <h1>Welcome to Your Dashboard</h1>
        <p>Manage your projects and build amazing full-stack applications</p>
      </div>

      <div className={styles.dashboardActions}>
        <button className={styles.btnPrimary} onClick={onShowUploadModal}>
          <i className="fas fa-upload"></i>
          <span>Upload New Project</span>
        </button>
        <button className={styles.btnOutline} onClick={showTemplates}>
          <i className="fas fa-layer-group"></i>
          <span>Browse Templates</span>
        </button>
        <button className={styles.btnOutline} onClick={showAnalytics}>
          <i className="fas fa-chart-bar"></i>
          <span>View Analytics</span>
        </button>
      </div>


      <div className={styles.projectsSection}>
        <h2>Your Projects</h2>
        <ProjectsGrid 
          projects={projects} 
          onDeleteProject={onDeleteProject}
          onShowUploadModal={onShowUploadModal}
        />
      </div>
    </div>
  )
}

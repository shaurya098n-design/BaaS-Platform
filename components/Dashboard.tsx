'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import DashboardMain from './DashboardMain'
import UploadModal from './UploadModal'
import ConfirmationModal from './ConfirmationModal'
import AnalysisModal from './AnalysisModal'
import { useInternalTabs } from './InternalTabs'
import AnalysisTab from './AnalysisTab'
import styles from './Dashboard.module.css'

interface DashboardProps {
  authToken: string | null
  currentUser?: any
}

export default function Dashboard({ authToken, currentUser }: DashboardProps) {
  const [projects, setProjects] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [githubStatus, setGithubStatus] = useState({ connected: false, username: '' })
  const { tabs, activeTab, addAnalysisTab, closeTab, switchTab } = useInternalTabs()
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  const [analysisModal, setAnalysisModal] = useState<{
    isOpen: boolean
    projectId: string
    projectName: string
  }>({
    isOpen: false,
    projectId: '',
    projectName: ''
  })

  const loadDashboardData = useCallback(async () => {
    try {
      const [projectsResponse, githubResponse] = await Promise.all([
        fetch(`/api/upload/apps?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }),
        fetch('/api/github/status', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
      ])
      
      if (projectsResponse.ok) {
        const result = await projectsResponse.json()
        const projectsData = result.data || []
        setProjects(projectsData)
      }
      
      if (githubResponse.ok) {
        const githubData = await githubResponse.json()
        console.log('GitHub status loaded:', githubData)
        // Try both githubData.data and githubData directly
        setGithubStatus(githubData.data || githubData)
      } else {
        console.log('GitHub status not available, setting default')
        setGithubStatus({ connected: false, username: '' })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Set default GitHub status if API fails
      setGithubStatus({ connected: false, username: '' })
    } finally {
      setLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    if (authToken) {
      loadDashboardData()
    }
  }, [authToken, loadDashboardData])

  const loadGitHubStatus = async () => {
    try {
      const response = await fetch('/api/github/status', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('GitHub status reloaded:', data)
        setGithubStatus(data.data || data)
      }
    } catch (error) {
      console.error('Error loading GitHub status:', error)
    }
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false)
    loadDashboardData()
  }


  const handleViewAnalysis = (projectId: string, projectName: string) => {
    addAnalysisTab(projectId, projectName)
  }

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId)
    const projectName = project?.appName || project?.name || 'this project'
    
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectName}"? This action cannot be undone and will permanently remove all project files.`,
      onConfirm: () => confirmDeleteProject(projectId)
    })
  }

  const confirmDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/upload/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setProjects(projects.filter((p: any) => p.id !== projectId))
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setConfirmationModal({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
      })
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="loading"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  const renderTabContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <DashboardMain 
          projects={projects}
          onShowUploadModal={() => setShowUploadModal(true)}
          onDeleteProject={handleDeleteProject}
          onViewAnalysis={handleViewAnalysis}
          authToken={authToken}
        />
      )
    }

    const activeTabData = tabs.find(tab => tab.id === activeTab)
    if (activeTabData?.type === 'analysis' && activeTabData.projectId) {
      return (
        <AnalysisTab 
          projectId={activeTabData.projectId}
          projectName={activeTabData.projectName || 'Unknown Project'}
          authToken={authToken}
        />
      )
    }

    return null
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.dashboardLayout}>
          <Sidebar 
            projects={projects} 
            githubStatus={githubStatus}
            currentUser={currentUser}
            onGitHubStatusChange={loadGitHubStatus}
          />
          <div className={styles.mainContent}>
            <div className={styles.tabBar}>
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                  onClick={() => switchTab(tab.id)}
                >
                  <div className={styles.tabContent}>
                    <i className={`fas fa-${tab.type === 'dashboard' ? 'home' : 'search'}`}></i>
                    <span className={styles.tabTitle}>{tab.title}</span>
                    {tab.closable && (
                      <button
                        className={styles.closeButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(tab.id)
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className={styles.tabSpacer}></div>
            </div>
            <div className={styles.tabContentArea}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
      
      {showUploadModal && (
        <UploadModal
          authToken={authToken}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal({
          isOpen: false,
          title: '',
          message: '',
          onConfirm: () => {}
        })}
      />
      
      <AnalysisModal
        isOpen={analysisModal.isOpen}
        projectId={analysisModal.projectId}
        projectName={analysisModal.projectName}
        authToken={authToken}
        onClose={() => setAnalysisModal({
          isOpen: false,
          projectId: '',
          projectName: ''
        })}
      />
    </div>
  )
}

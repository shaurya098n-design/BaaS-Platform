'use client'

import { useState } from 'react'
import styles from './ProjectsGrid.module.css'
import ConnectModal from './ConnectModal'

interface ProjectsGridProps {
  projects: any[]
  onDeleteProject: (projectId: string) => void
  onShowUploadModal: () => void
  onViewAnalysis: (projectId: string, projectName: string) => void
  viewMode?: 'grid' | 'list'
  authToken: string | null
}

export default function ProjectsGrid({ projects, onDeleteProject, onShowUploadModal, onViewAnalysis, viewMode = 'grid', authToken }: ProjectsGridProps) {
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{id: string, name: string} | null>(null)
  
  if (projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className="fas fa-folder-open"></i>
        <h3>No projects yet</h3>
        <p>Upload your first project to get started!</p>
        <button 
          className={styles.uploadButton}
          onClick={onShowUploadModal}
        >
          <i className="fas fa-upload"></i>
          <span>Upload Project</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`${styles.projectsGrid} ${viewMode === 'list' ? styles.listView : styles.gridView}`}>
      {projects.map((project) => {
        // Since all uploaded ZIP files are automatically extracted, we show them as extracted
        const wasZipFile = project.original_filename && project.original_filename.toLowerCase().endsWith('.zip')
        const isExtracted = true // All uploaded files are now extracted
        let cardClass = styles.projectCard
        
        if (wasZipFile) {
          cardClass = `${styles.projectCard} ${styles.extractedFile}`
        }
        
        return (
          <div 
            key={project.id} 
            className={cardClass}
            onClick={() => onViewAnalysis(project.id, project.appName || project.name)}
            style={{ cursor: 'pointer' }}
          >
            {wasZipFile && <i className="fas fa-folder-open"></i>}
            <div className={styles.projectHeader}>
              <div className={styles.projectTitle}>{project.appName || project.name}</div>
            </div>
            {/* description removed as per request */}
            <div className={styles.projectActions}>
              <button 
                className={`${styles.btnSmall} ${styles.btnSecondary}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedProject({
                    id: project.id,
                    name: project.appName || project.name
                  })
                  setConnectModalOpen(true)
                }}
              >
                Connect
              </button>
              <button
                className={styles.cardDelete}
                title="Delete project"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteProject(project.id)
                }}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        )
      })}
      
      {connectModalOpen && selectedProject && (
        <ConnectModal
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          authToken={authToken}
          onClose={() => {
            setConnectModalOpen(false)
            setSelectedProject(null)
          }}
          onSuccess={() => {
            // Handle successful connection
            console.log('Backend connected successfully!')
          }}
        />
      )}
    </div>
  )
}

'use client'

import styles from './ProjectsGrid.module.css'

interface ProjectsGridProps {
  projects: any[]
  onDeleteProject: (projectId: string) => void
  onShowUploadModal: () => void
  onViewAnalysis: (projectId: string, projectName: string) => void
  viewMode?: 'grid' | 'list'
}

export default function ProjectsGrid({ projects, onDeleteProject, onShowUploadModal, onViewAnalysis, viewMode = 'grid' }: ProjectsGridProps) {
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
        const isZipFile = project.original_filename && project.original_filename.toLowerCase().endsWith('.zip')
        const isExtracted = project.original_filename === 'extracted_files'
        let cardClass = styles.projectCard
        
        if (isZipFile) {
          cardClass = `${styles.projectCard} ${styles.zipFile}`
        } else if (isExtracted) {
          cardClass = `${styles.projectCard} ${styles.extractedFile}`
        }
        
        return (
          <div key={project.id} className={cardClass}>
            {isZipFile && <i className="fas fa-file-archive"></i>}
            <div className={styles.projectHeader}>
              <div className={styles.projectTitle}>{project.appName || project.name}</div>
              <div className={`${styles.projectStatus} ${styles[`status${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`]}`}>
                {project.status}
              </div>
            </div>
            <div className={styles.projectDescription}>
              {project.description || 'No description'}
              {isZipFile && (
                <>
                  <br />
                  <small>
                    <i className="fas fa-file-archive"></i> ZIP Archive - Click to view contents
                  </small>
                </>
              )}
              {isExtracted && (
                <>
                  <br />
                  <small>
                    <i className="fas fa-folder-open"></i> Extracted Files - Individual files in database
                  </small>
                </>
              )}
            </div>
            <div className={styles.projectActions}>
              <button 
                className={`${styles.btnSmall} ${styles.btnSecondary}`}
                onClick={() => onViewAnalysis(project.id, project.appName || project.name)}
              >
                View Analysis
              </button>
              <button 
                className={`${styles.btnSmall} ${styles.btnDanger}`}
                onClick={() => onDeleteProject(project.id)}
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

'use client'

import styles from './ProjectsGrid.module.css'

interface ProjectsGridProps {
  projects: any[]
  onDeleteProject: (projectId: string) => void
  onShowUploadModal: () => void
}

export default function ProjectsGrid({ projects, onDeleteProject, onShowUploadModal }: ProjectsGridProps) {
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
    <div className={styles.projectsGrid}>
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
              <a 
                href={project.appUrl || project.frontend_url} 
                target="_blank" 
                className={`${styles.btnSmall} ${styles.btnSuccess}`}
              >
                View App
              </a>
              <a 
                href={project.apiBaseUrl || project.admin_url} 
                target="_blank" 
                className={`${styles.btnSmall} ${styles.btnWarning}`}
              >
                API
              </a>
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

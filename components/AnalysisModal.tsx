'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './AnalysisModal.module.css'

interface AnalysisModalProps {
  isOpen: boolean
  projectId: string
  projectName: string
  authToken: string | null
  onClose: () => void
}

interface AnalysisData {
  framework: {
    name: string
    version: string | null
    confidence: number
  }
  structure: {
    hasPackageJson: boolean
    hasSrc: boolean
    hasPublic: boolean
    entryPoints: string[]
    configFiles: string[]
    directories: string[]
  }
  files: Array<{
    path: string
    size: number
    extension: string
    type: string
    lines: number
    language: string
    content: string | null
  }>
  pages: Array<{
    path: string
    title: string
    description: string
    scripts: string[]
    stylesheets: string[]
    links: Array<{ href: string; text: string }>
  }>
  components: Array<{
    type: string
    name: string
    framework?: string
  }>
  forms: Array<{
    id: string
    action: string
    method: string
    fields: Array<{
      type: string
      name: string
      required: boolean
    }>
  }>
  apis: Array<{
    type: string
    url: string
    method: string
  }>
  requirements: {
    authentication: boolean
    crud: Array<{ operation: string; resource: string }>
    fileUpload: boolean
    search: boolean
  }
  recommendations: Array<{
    type: string
    message: string
    priority: string
  }>
}

export default function AnalysisModal({ isOpen, projectId, projectName, authToken, onClose }: AnalysisModalProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const analyzeProject = useCallback(async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/upload/analyze/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setAnalysis(result.data)
      } else {
        setError(result.message || 'Analysis failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [projectId, authToken])

  useEffect(() => {
    if (isOpen && projectId) {
      analyzeProject()
    }
  }, [isOpen, projectId, analyzeProject])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>
            <i className="fas fa-search"></i>
            Project Analysis: {projectName}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="loading"></div>
              <p>Analyzing project structure and code...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
              <button className={styles.retryBtn} onClick={analyzeProject}>
                <i className="fas fa-redo"></i>
                Retry Analysis
              </button>
            </div>
          ) : analysis ? (
            <>
              {/* Tabs */}
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="fas fa-chart-pie"></i>
                  Overview
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'files' ? styles.active : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  <i className="fas fa-folder"></i>
                  Files ({analysis.files.length})
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'pages' ? styles.active : ''}`}
                  onClick={() => setActiveTab('pages')}
                >
                  <i className="fas fa-file-alt"></i>
                  Pages ({analysis.pages.length})
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'components' ? styles.active : ''}`}
                  onClick={() => setActiveTab('components')}
                >
                  <i className="fas fa-puzzle-piece"></i>
                  Components ({analysis.components.length})
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'apis' ? styles.active : ''}`}
                  onClick={() => setActiveTab('apis')}
                >
                  <i className="fas fa-plug"></i>
                  APIs ({analysis.apis.length})
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'requirements' ? styles.active : ''}`}
                  onClick={() => setActiveTab('requirements')}
                >
                  <i className="fas fa-cogs"></i>
                  Requirements
                </button>
              </div>

              {/* Tab Content */}
              <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                  <div className={styles.overview}>
                    <div className={styles.frameworkInfo}>
                      <h3>
                        <i className="fas fa-code"></i>
                        Framework Detection
                      </h3>
                      <div className={styles.frameworkCard}>
                        <div className={styles.frameworkName}>
                          {analysis.framework.name.charAt(0).toUpperCase() + analysis.framework.name.slice(1)}
                        </div>
                        <div className={styles.frameworkDetails}>
                          {analysis.framework.version && (
                            <span className={styles.version}>v{analysis.framework.version}</span>
                          )}
                          <span className={styles.confidence}>
                            Confidence: {Math.round(analysis.framework.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.structureInfo}>
                      <h3>
                        <i className="fas fa-sitemap"></i>
                        Project Structure
                      </h3>
                      <div className={styles.structureGrid}>
                        <div className={styles.structureItem}>
                          <i className="fas fa-file-package"></i>
                          <span>Package.json: {analysis.structure.hasPackageJson ? 'Yes' : 'No'}</span>
                        </div>
                        <div className={styles.structureItem}>
                          <i className="fas fa-folder"></i>
                          <span>Source Directory: {analysis.structure.hasSrc ? 'Yes' : 'No'}</span>
                        </div>
                        <div className={styles.structureItem}>
                          <i className="fas fa-globe"></i>
                          <span>Public Directory: {analysis.structure.hasPublic ? 'Yes' : 'No'}</span>
                        </div>
                        <div className={styles.structureItem}>
                          <i className="fas fa-play"></i>
                          <span>Entry Points: {analysis.structure.entryPoints.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <i className="fas fa-file-code"></i>
                        <div className={styles.statNumber}>{analysis.files.length}</div>
                        <div className={styles.statLabel}>Total Files</div>
                      </div>
                      <div className={styles.statCard}>
                        <i className="fas fa-file-alt"></i>
                        <div className={styles.statNumber}>{analysis.pages.length}</div>
                        <div className={styles.statLabel}>Pages</div>
                      </div>
                      <div className={styles.statCard}>
                        <i className="fas fa-puzzle-piece"></i>
                        <div className={styles.statNumber}>{analysis.components.length}</div>
                        <div className={styles.statLabel}>Components</div>
                      </div>
                      <div className={styles.statCard}>
                        <i className="fas fa-plug"></i>
                        <div className={styles.statNumber}>{analysis.apis.length}</div>
                        <div className={styles.statLabel}>API Calls</div>
                      </div>
                    </div>

                    {analysis.recommendations.length > 0 && (
                      <div className={styles.recommendations}>
                        <h3>
                          <i className="fas fa-lightbulb"></i>
                          Recommendations
                        </h3>
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className={styles.recommendation}>
                            <div 
                              className={styles.priority}
                              style={{ backgroundColor: getPriorityColor(rec.priority) }}
                            >
                              {rec.priority}
                            </div>
                            <div className={styles.recommendationText}>{rec.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className={styles.files}>
                    <div className={styles.filesHeader}>
                      <h3>
                        <i className="fas fa-folder"></i>
                        Project Files
                      </h3>
                      <div className={styles.filesStats}>
                        {analysis.files.length} files • {formatFileSize(analysis.files.reduce((sum, file) => sum + file.size, 0))}
                      </div>
                    </div>
                    
                    <div className={styles.filesList}>
                      {analysis.files.map((file, index) => (
                        <div 
                          key={index} 
                          className={`${styles.fileItem} ${selectedFile === file.path ? styles.selected : ''}`}
                          onClick={() => setSelectedFile(selectedFile === file.path ? null : file.path)}
                        >
                          <div className={styles.fileInfo}>
                            <i className={`fas fa-${file.extension === '.js' || file.extension === '.jsx' ? 'file-code' : 
                              file.extension === '.html' ? 'file-code' : 
                              file.extension === '.css' ? 'file-code' : 
                              file.extension === '.json' ? 'file-code' : 'file'}`}></i>
                            <div className={styles.fileDetails}>
                              <div className={styles.fileName}>{file.path}</div>
                              <div className={styles.fileMeta}>
                                {file.type} • {formatFileSize(file.size)} • {file.lines} lines
                              </div>
                            </div>
                          </div>
                          <div className={styles.fileActions}>
                            <span className={styles.fileLanguage}>{file.language}</span>
                            <i className={`fas fa-chevron-${selectedFile === file.path ? 'up' : 'down'}`}></i>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedFile && (
                      <div className={styles.filePreview}>
                        <div className={styles.filePreviewHeader}>
                          <h4>{selectedFile}</h4>
                          <button 
                            className={styles.closePreview}
                            onClick={() => setSelectedFile(null)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className={styles.filePreviewContent}>
                          {(() => {
                            const file = analysis.files.find(f => f.path === selectedFile)
                            if (!file || !file.content) {
                              return <div className={styles.noPreview}>No preview available</div>
                            }
                            return (
                              <pre className={styles.codePreview}>
                                <code className={`language-${file.language}`}>
                                  {file.content.substring(0, 1000)}
                                  {file.content.length > 1000 && '...'}
                                </code>
                              </pre>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pages' && (
                  <div className={styles.pages}>
                    <h3>
                      <i className="fas fa-file-alt"></i>
                      Pages ({analysis.pages.length})
                    </h3>
                    {analysis.pages.map((page, index) => (
                      <div key={index} className={styles.pageCard}>
                        <div className={styles.pageHeader}>
                          <h4>{page.title || 'Untitled Page'}</h4>
                          <span className={styles.pagePath}>{page.path}</span>
                        </div>
                        {page.description && (
                          <p className={styles.pageDescription}>{page.description}</p>
                        )}
                        <div className={styles.pageDetails}>
                          <div className={styles.pageDetail}>
                            <i className="fas fa-code"></i>
                            <span>{page.scripts.length} Scripts</span>
                          </div>
                          <div className={styles.pageDetail}>
                            <i className="fas fa-palette"></i>
                            <span>{page.stylesheets.length} Stylesheets</span>
                          </div>
                          <div className={styles.pageDetail}>
                            <i className="fas fa-link"></i>
                            <span>{page.links.length} Links</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'components' && (
                  <div className={styles.components}>
                    <h3>
                      <i className="fas fa-puzzle-piece"></i>
                      Components ({analysis.components.length})
                    </h3>
                    {analysis.components.map((component, index) => (
                      <div key={index} className={styles.componentCard}>
                        <div className={styles.componentHeader}>
                          <i className="fas fa-cube"></i>
                          <div className={styles.componentInfo}>
                            <div className={styles.componentName}>{component.name}</div>
                            <div className={styles.componentType}>{component.type}</div>
                          </div>
                        </div>
                        {component.framework && (
                          <div className={styles.componentFramework}>
                            <i className="fas fa-code"></i>
                            {component.framework}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'apis' && (
                  <div className={styles.apis}>
                    <h3>
                      <i className="fas fa-plug"></i>
                      API Calls ({analysis.apis.length})
                    </h3>
                    {analysis.apis.map((api, index) => (
                      <div key={index} className={styles.apiCard}>
                        <div className={styles.apiMethod}>{api.method}</div>
                        <div className={styles.apiUrl}>{api.url}</div>
                        <div className={styles.apiType}>{api.type}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div className={styles.requirements}>
                    <h3>
                      <i className="fas fa-cogs"></i>
                      Backend Requirements
                    </h3>
                    
                    <div className={styles.requirementSection}>
                      <h4>
                        <i className="fas fa-shield-alt"></i>
                        Authentication
                      </h4>
                      <div className={styles.requirementStatus}>
                        {analysis.requirements.authentication ? (
                          <span className={styles.required}>Required</span>
                        ) : (
                          <span className={styles.notRequired}>Not Required</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.requirementSection}>
                      <h4>
                        <i className="fas fa-database"></i>
                        CRUD Operations
                      </h4>
                      {analysis.requirements.crud.length > 0 ? (
                        <div className={styles.crudList}>
                          {analysis.requirements.crud.map((crud, index) => (
                            <div key={index} className={styles.crudItem}>
                              <span className={styles.crudOperation}>{crud.operation}</span>
                              <span className={styles.crudResource}>{crud.resource}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className={styles.notRequired}>No CRUD operations detected</span>
                      )}
                    </div>

                    <div className={styles.requirementSection}>
                      <h4>
                        <i className="fas fa-upload"></i>
                        File Upload
                      </h4>
                      <div className={styles.requirementStatus}>
                        {analysis.requirements.fileUpload ? (
                          <span className={styles.required}>Required</span>
                        ) : (
                          <span className={styles.notRequired}>Not Required</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.requirementSection}>
                      <h4>
                        <i className="fas fa-search"></i>
                        Search Functionality
                      </h4>
                      <div className={styles.requirementStatus}>
                        {analysis.requirements.search ? (
                          <span className={styles.required}>Required</span>
                        ) : (
                          <span className={styles.notRequired}>Not Required</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

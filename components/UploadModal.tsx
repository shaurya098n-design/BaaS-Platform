'use client'

import { useState } from 'react'
import styles from './UploadModal.module.css'

interface UploadModalProps {
  authToken: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function UploadModal({ authToken, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [appName, setAppName] = useState('')
  const [description, setDescription] = useState('')
  const [frontendType, setFrontendType] = useState('react')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type === 'application/zip' || selectedFile.name.toLowerCase().endsWith('.zip')) {
      setFile(selectedFile)
      if (!appName) {
        setAppName(selectedFile.name.replace('.zip', '').replace(/[^a-zA-Z0-9-_]/g, '-'))
      }
      setError('')
    } else {
      setError('Please select a ZIP file. Only .zip files are supported.')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload')
      return
    }
    if (!appName || appName.trim() === '') {
      setError('Please enter an app name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('appName', appName)
      formData.append('description', description)
      formData.append('frontendType', frontendType)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(result.message || 'Upload failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Upload New Project</h2>
          <button className={styles.modalClose} onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="file">Project File (ZIP)</label>
              <div 
                className={`${styles.fileUpload} ${dragActive ? styles.dragActive : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file"
                  accept=".zip"
                  onChange={handleFileInput}
                  className={styles.fileInput}
                />
                <div className={styles.fileUploadContent}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>
                    {file ? (
                      <>
                        <strong>{file.name}</strong>
                        <br />
                        <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                      </>
                    ) : (
                      'Drag & drop your ZIP file here or click to browse'
                    )}
                  </p>
                  <button type="button" className={styles.browseBtn}>
                    {file ? 'Change File' : 'Browse Files'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="appName">App Name</label>
              <input
                type="text"
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value.replace(/[^a-zA-Z0-9-]/g, '-'))}
                required
                placeholder="Enter your app name (letters, numbers, hyphens only)"
                title="Only letters, numbers, hyphens, and underscores are allowed"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="frontendType">Frontend Framework</label>
              <select
                id="frontendType"
                value={frontendType}
                onChange={(e) => setFrontendType(e.target.value)}
                className={styles.select}
              >
                <option value="react">React</option>
                <option value="vue">Vue.js</option>
                <option value="angular">Angular</option>
                <option value="svelte">Svelte</option>
                <option value="vanilla">Vanilla HTML/CSS/JS</option>
                <option value="nextjs">Next.js</option>
                <option value="nuxt">Nuxt.js</option>
                <option value="sveltekit">SvelteKit</option>
                <option value="astro">Astro</option>
              </select>
              <small style={{color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block'}}>
                We'll automatically generate the backend and database for you
              </small>
            </div>

            
            <div className={styles.formGroup}>
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                rows={3}
              />
            </div>
            
            <button type="submit" className={styles.btnPrimary} disabled={loading || !file}>
              {loading ? (
                <>
                  <span className="loading"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  Upload Project
                </>
              )}
            </button>
            
            {error && <div className={styles.errorMessage}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import styles from './FileTree.module.css'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'folder'
  size?: number
  extension?: string
  language?: string
  lines?: number
  children?: FileNode[]
  content?: string | null
}

interface FileTreeProps {
  files: Array<{
    path: string
    size: number
    extension: string
    type: string
    lines: number
    language: string
    content: string | null
  }>
  onFileSelect: (filePath: string) => void
  selectedFile: string | null
  storageKey?: string
}

export default function FileTree({ files, onFileSelect, selectedFile, storageKey }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    try {
      if (typeof window !== 'undefined' && storageKey) {
        const raw = localStorage.getItem(storageKey)
        if (raw) {
          const arr = JSON.parse(raw)
          if (Array.isArray(arr)) {
            return new Set<string>(arr)
          }
        }
      }
    } catch {}
    return new Set<string>([])
  })

  // Convert flat file list to hierarchical tree structure
  const buildFileTree = (files: any[]): FileNode[] => {
    const tree: { [key: string]: FileNode } = {}
    
    // Filter out node_modules and other unnecessary files
    const filteredFiles = files.filter(file => 
      !file.path.includes('node_modules') && 
      !file.path.includes('.git') &&
      !file.path.includes('package-lock.json') &&
      !file.path.endsWith('.d.ts') &&
      !file.path.includes('.next') &&
      !file.path.includes('dist') &&
      !file.path.includes('build')
    )

    filteredFiles.forEach(file => {
      const pathParts = file.path.split('/')
      let currentPath = ''
      
      pathParts.forEach((part, index) => {
        const fullPath = currentPath ? `${currentPath}/${part}` : part
        const isLast = index === pathParts.length - 1
        
        if (!tree[fullPath]) {
          tree[fullPath] = {
            name: part,
            path: fullPath,
            type: isLast ? 'file' : 'folder',
            children: isLast ? undefined : []
          }
        }
        
        if (isLast) {
          // This is a file
          tree[fullPath] = {
            ...tree[fullPath],
            size: file.size,
            extension: file.extension,
            language: file.language,
            lines: file.lines,
            content: file.content
          }
        }
        
        // Add to parent's children
        if (currentPath && tree[currentPath]) {
          if (!tree[currentPath].children) {
            tree[currentPath].children = []
          }
          if (!tree[currentPath].children!.find(child => child.path === fullPath)) {
            tree[currentPath].children!.push(tree[fullPath])
          }
        }
        
        currentPath = fullPath
      })
    })
    
    // Return root level items
    return Object.values(tree).filter(node => 
      !node.path.includes('/') || node.path.split('/').length === 1
    ).sort((a, b) => {
      // Folders first, then files
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  }

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
    try {
      if (typeof window !== 'undefined' && storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newExpanded)))
      }
    } catch {}
  }

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      return expandedFolders.has(node.path) ? 'fa-folder-open' : 'fa-folder'
    }
    
    const ext = node.extension?.toLowerCase()
    switch (ext) {
      case '.html':
      case '.htm':
        return 'fa-file-code'
      case '.css':
      case '.scss':
      case '.sass':
      case '.less':
        return 'fa-file-code'
      case '.js':
      case '.jsx':
        return 'fa-file-code'
      case '.ts':
      case '.tsx':
        return 'fa-file-code'
      case '.json':
        return 'fa-file-code'
      case '.md':
        return 'fa-file-alt'
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.svg':
        return 'fa-file-image'
      case '.pdf':
        return 'fa-file-pdf'
      case '.zip':
      case '.rar':
        return 'fa-file-archive'
      default:
        return 'fa-file'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = selectedFile === node.path
    
    return (
      <div key={node.path}>
        <div 
          className={`${styles.node} ${isSelected ? styles.selected : ''}`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path)
            } else {
              onFileSelect(node.path)
            }
          }}
        >
          <div className={styles.nodeContent}>
            <i className={`fas ${getFileIcon(node)} ${styles.nodeIcon}`}></i>
            <span className={styles.nodeName}>{node.name}</span>
            {node.type === 'file' && node.size && (
              <span className={styles.nodeSize}>{formatFileSize(node.size)}</span>
            )}
            {node.type === 'file' && node.lines && (
              <span className={styles.nodeLines}>{node.lines} lines</span>
            )}
          </div>
          {node.type === 'folder' && (
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} ${styles.chevron}`}></i>
          )}
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div className={styles.children}>
            {node.children
              .sort((a, b) => {
                if (a.type !== b.type) {
                  return a.type === 'folder' ? -1 : 1
                }
                return a.name.localeCompare(b.name)
              })
              .map(child => renderNode(child, depth + 1))
            }
          </div>
        )}
      </div>
    )
  }

  const fileTree = buildFileTree(files)

  return (
    <div className={styles.fileTree}>
      <div className={styles.treeHeader}>
        <h3>
          <i className="fas fa-folder"></i>
          Project Files
        </h3>
        <div className={styles.treeStats}>
          {fileTree.length} items
        </div>
      </div>
      
      <div className={styles.treeContent}>
        {fileTree.map(node => renderNode(node))}
      </div>
    </div>
  )
}

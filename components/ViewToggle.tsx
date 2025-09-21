'use client'

import { useState } from 'react'
import styles from './ViewToggle.module.css'

interface ViewToggleProps {
  currentView: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className={styles.viewToggle}>
      <button
        className={`${styles.toggleBtn} ${currentView === 'grid' ? styles.active : ''}`}
        onClick={() => onViewChange('grid')}
        title="Grid View"
      >
        <i className="fas fa-th"></i>
      </button>
      <button
        className={`${styles.toggleBtn} ${currentView === 'list' ? styles.active : ''}`}
        onClick={() => onViewChange('list')}
        title="List View"
      >
        <i className="fas fa-list"></i>
      </button>
    </div>
  )
}

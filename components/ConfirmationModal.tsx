'use client'

import { useEffect } from 'react'
import styles from './ConfirmationModal.module.css'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      if (document.body) {
        document.body.style.overflow = 'hidden'
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      if (document.body) {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'fas fa-exclamation-triangle',
          iconColor: 'var(--error-color)',
          confirmBg: 'linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%)'
        }
      case 'warning':
        return {
          icon: 'fas fa-exclamation-circle',
          iconColor: 'var(--warning-color)',
          confirmBg: 'linear-gradient(135deg, var(--warning-color) 0%, #d97706 100%)'
        }
      case 'info':
        return {
          icon: 'fas fa-info-circle',
          iconColor: 'var(--primary-color)',
          confirmBg: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)'
        }
      default:
        return {
          icon: 'fas fa-question-circle',
          iconColor: 'var(--text-secondary)',
          confirmBg: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)'
        }
    }
  }

  const typeStyles = getTypeStyles()

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconContainer} style={{ color: typeStyles.iconColor }}>
            <i className={typeStyles.icon}></i>
          </div>
          <h2 className={styles.title}>{title}</h2>
        </div>
        
        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.footer}>
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={styles.confirmButton}
            onClick={onConfirm}
            style={{ background: typeStyles.confirmBg }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}


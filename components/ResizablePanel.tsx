'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import styles from './ResizablePanel.module.css'

interface ResizablePanelProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  initialLeftWidth?: number
  minLeftWidth?: number
  maxLeftWidth?: number
}

export default function ResizablePanel({ 
  leftPanel, 
  rightPanel, 
  initialLeftWidth = 300,
  minLeftWidth = 200,
  maxLeftWidth = 500
}: ResizablePanelProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newLeftWidth = e.clientX - containerRect.left

    // Constrain the width within min/max bounds
    const constrainedWidth = Math.min(
      Math.max(newLeftWidth, minLeftWidth),
      maxLeftWidth
    )

    setLeftWidth(constrainedWidth)
  }, [isResizing, minLeftWidth, maxLeftWidth])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div 
      ref={containerRef}
      className={`${styles.resizableContainer} ${isResizing ? styles.resizing : ''}`}
    >
      <div 
        className={styles.leftPanel}
        style={{ width: `${leftWidth}px` }}
      >
        {leftPanel}
      </div>
      
      <div 
        className={styles.resizeHandle}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.resizeHandleLine}></div>
      </div>
      
      <div className={styles.rightPanel}>
        {rightPanel}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import styles from './InternalTabs.module.css'

interface Tab {
  id: string
  title: string
  type: 'dashboard' | 'analysis'
  projectId?: string
  projectName?: string
  closable?: boolean
}

interface InternalTabsProps {
  children: React.ReactNode
  onTabChange?: (activeTab: string) => void
}

export default function InternalTabs({ children, onTabChange }: InternalTabsProps) {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'dashboard', title: 'Dashboard', type: 'dashboard', closable: false }
  ])
  const [activeTab, setActiveTab] = useState('dashboard')

  const addTab = (tab: Omit<Tab, 'id'>) => {
    const newTab: Tab = {
      ...tab,
      id: `${tab.type}-${tab.projectId || Date.now()}`
    }
    
    setTabs(prev => {
      // Check if tab already exists
      const existingTab = prev.find(t => 
        t.type === tab.type && 
        t.projectId === tab.projectId
      )
      
      if (existingTab) {
        setActiveTab(existingTab.id)
        return prev
      }
      
      return [...prev, newTab]
    })
    
    setActiveTab(newTab.id)
    onTabChange?.(newTab.id)
  }

  const closeTab = (tabId: string) => {
    if (tabId === 'dashboard') return // Can't close dashboard tab
    
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      
      // If closing active tab, switch to dashboard
      if (activeTab === tabId) {
        setActiveTab('dashboard')
        onTabChange?.('dashboard')
      }
      
      return newTabs
    })
  }

  const switchTab = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <div className={styles.internalTabs}>
      {/* Tab Navigation Bar */}
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

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {children}
      </div>
    </div>
  )
}

// Hook to use tabs functionality
export const useInternalTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'dashboard', title: 'Dashboard', type: 'dashboard', closable: false }
  ])
  const [activeTab, setActiveTab] = useState('dashboard')

  const addAnalysisTab = (projectId: string, projectName: string) => {
    const newTab: Tab = {
      id: `analysis-${projectId}`,
      title: `Analysis: ${projectName}`,
      type: 'analysis',
      projectId,
      projectName,
      closable: true
    }
    
    setTabs(prev => {
      // Check if tab already exists
      const existingTab = prev.find(t => 
        t.type === 'analysis' && 
        t.projectId === projectId
      )
      
      if (existingTab) {
        setActiveTab(existingTab.id)
        return prev
      }
      
      return [...prev, newTab]
    })
    
    setActiveTab(newTab.id)
  }

  const closeTab = (tabId: string) => {
    if (tabId === 'dashboard') return
    
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      
      if (activeTab === tabId) {
        setActiveTab('dashboard')
      }
      
      return newTabs
    })
  }

  const switchTab = (tabId: string) => {
    setActiveTab(tabId)
  }

  return {
    tabs,
    activeTab,
    addAnalysisTab,
    closeTab,
    switchTab
  }
}

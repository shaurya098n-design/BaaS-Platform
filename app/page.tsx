'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import AuthModal from '@/components/AuthModal'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const user = await response.json()
          setCurrentUser(user)
          setAuthToken(token)
        } else {
          logout()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        logout()
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setAuthToken(null)
    setCurrentUser(null)
  }

  const showLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const showRegister = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }

  const handleAuthSuccess = (user: any, token: string) => {
    setCurrentUser(user)
    setAuthToken(token)
    setShowAuthModal(false)
  }

  if (currentUser) {
    return (
      <>
        <Header 
          currentUser={currentUser} 
          onLogout={logout}
          showAuthButtons={false}
        />
        <Dashboard authToken={authToken} />
      </>
    )
  }

  return (
    <>
      <Header 
        currentUser={null} 
        onLogout={logout}
        showAuthButtons={true}
        onShowLogin={showLogin}
        onShowRegister={showRegister}
      />
      <main>
        <Hero onShowLogin={showLogin} onShowRegister={showRegister} />
        <Features />
      </main>
      
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      )}
    </>
  )
}


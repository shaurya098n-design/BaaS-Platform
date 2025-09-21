'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [isLoading, setIsLoading] = useState(true)

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          setCurrentUser(result.data.user)
          setAuthToken(token)
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('authToken')
          setCurrentUser(null)
          setAuthToken(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Network error, clear token
        localStorage.removeItem('authToken')
        setCurrentUser(null)
        setAuthToken(null)
      }
    } else {
      // No token, user is not authenticated
      setCurrentUser(null)
      setAuthToken(null)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

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

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: '600'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>Loading...</div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (currentUser) {
    return (
      <>
        <Header 
          currentUser={currentUser} 
          onLogout={logout}
          showAuthButtons={false}
        />
        <Dashboard authToken={authToken} currentUser={currentUser} />
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


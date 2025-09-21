'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './AuthModal.module.css'

interface AuthModalProps {
  mode: 'login' | 'register'
  onClose: () => void
  onSuccess: (user: any, token: string) => void
  onSwitchMode: () => void
}

export default function AuthModal({ mode, onClose, onSuccess, onSwitchMode }: AuthModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    if (document.body) {
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      if (document.body) {
        document.body.style.overflow = 'unset'
      }
    }
  }, [])

  useEffect(() => {
    if (mode === 'register' && formData.password) {
      const strength = calculatePasswordStrength(formData.password)
      setPasswordStrength(strength)
    }
  }, [formData.password, mode])

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {}
    
    if (mode === 'register') {
      if (!formData.name.trim()) {
        errors.name = 'Full name is required'
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters'
      }
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (mode === 'register' && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    
    if (mode === 'register') {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('authToken', data.data.token)
        onSuccess(data.data.user, data.data.token)
      } else {
        setError(data.message || `${mode === 'login' ? 'Login' : 'Registration'} failed`)
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear field-specific errors when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      })
    }
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return '#ef4444'
    if (strength <= 3) return '#f59e0b'
    if (strength <= 4) return '#3b82f6'
    return '#10b981'
  }

  const getPasswordStrengthText = (strength: number): string => {
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  return (
    <div 
      className={`${styles.modal} ${isVisible ? styles.visible : ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className={`${styles.modalContent} ${isVisible ? styles.visible : ''}`}
        ref={modalRef}
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <i className={`fas fa-${mode === 'login' ? 'sign-in-alt' : 'user-plus'}`}></i>
            </div>
            <div>
              <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{mode === 'login' ? 'Sign in to your account' : 'Join our platform today'}</p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className={styles.formGroup}>
                <label htmlFor="name">
                  <i className="fas fa-user"></i>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? styles.error : ''}
                  placeholder="Enter your full name"
                />
                {formErrors.name && <span className={styles.fieldError}>{formErrors.name}</span>}
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={formErrors.email ? styles.error : ''}
                placeholder="Enter your email"
              />
              {formErrors.email && <span className={styles.fieldError}>{formErrors.email}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={formErrors.password ? styles.error : ''}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePassword}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              {formErrors.password && <span className={styles.fieldError}>{formErrors.password}</span>}
              
              {mode === 'register' && formData.password && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div 
                      className={styles.strengthFill}
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength)
                      }}
                    ></div>
                  </div>
                  <span 
                    className={styles.strengthText}
                    style={{ color: getPasswordStrengthColor(passwordStrength) }}
                  >
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
              )}
            </div>
            
            {mode === 'register' && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">
                  <i className="fas fa-lock"></i>
                  Confirm Password
                </label>
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={formErrors.confirmPassword ? styles.error : ''}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={toggleConfirmPassword}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                </div>
                {formErrors.confirmPassword && <span className={styles.fieldError}>{formErrors.confirmPassword}</span>}
              </div>
            )}
            
            <button 
              type="submit" 
              className={`${styles.btnPrimary} ${loading ? styles.loading : ''}`} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading"></span>
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  <i className={`fas fa-${mode === 'login' ? 'sign-in-alt' : 'user-plus'}`}></i>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
            
            {error && (
              <div className={styles.errorMessage}>
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}
          </form>
          
          <div className={styles.divider}>
            <span>or</span>
          </div>
          
          <div className={styles.socialAuth}>
            <button type="button" className={styles.socialBtn}>
              <i className="fab fa-google"></i>
              Continue with Google
            </button>
            <button type="button" className={styles.socialBtn}>
              <i className="fab fa-github"></i>
              Continue with GitHub
            </button>
          </div>
          
          <div className={styles.authSwitch}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={onSwitchMode} className={styles.switchLink}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={onSwitchMode} className={styles.switchLink}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

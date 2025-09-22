'use client'

import { useState } from 'react'
import styles from './ConnectModal.module.css'

interface ConnectModalProps {
  projectId: string
  projectName: string
  authToken: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function ConnectModal({ projectId, projectName, authToken, onClose, onSuccess }: ConnectModalProps) {
  const [appType, setAppType] = useState('')
  const [selectedAPIs, setSelectedAPIs] = useState<string[]>([])
  const [githubUrl, setGithubUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  // Comprehensive application types
  const allAppTypes = [
    { id: 'ecommerce', name: 'E-commerce', description: 'Online store, shopping cart, payments', icon: 'fas fa-shopping-cart' },
    { id: 'finance', name: 'Finance', description: 'Banking, investments, financial tracking', icon: 'fas fa-chart-line' },
    { id: 'blog', name: 'Blog', description: 'Content management, posts, comments', icon: 'fas fa-blog' },
    { id: 'saas', name: 'SaaS', description: 'Software as a service, subscriptions', icon: 'fas fa-cloud' },
    { id: 'social', name: 'Social Media', description: 'Social networking, messaging, feeds', icon: 'fas fa-users' },
    { id: 'education', name: 'Education', description: 'Learning management, courses, quizzes', icon: 'fas fa-graduation-cap' },
    { id: 'healthcare', name: 'Healthcare', description: 'Medical records, appointments, telemedicine', icon: 'fas fa-heartbeat' },
    { id: 'realestate', name: 'Real Estate', description: 'Property listings, agents, bookings', icon: 'fas fa-home' },
    { id: 'travel', name: 'Travel', description: 'Bookings, itineraries, reviews', icon: 'fas fa-plane' },
    { id: 'food', name: 'Food & Restaurant', description: 'Menu, orders, delivery, reviews', icon: 'fas fa-utensils' },
    { id: 'fitness', name: 'Fitness', description: 'Workouts, tracking, nutrition', icon: 'fas fa-dumbbell' },
    { id: 'entertainment', name: 'Entertainment', description: 'Streaming, events, bookings', icon: 'fas fa-film' },
    { id: 'gaming', name: 'Gaming', description: 'Games, leaderboards, tournaments', icon: 'fas fa-gamepad' },
    { id: 'news', name: 'News & Media', description: 'Articles, videos, subscriptions', icon: 'fas fa-newspaper' },
    { id: 'job', name: 'Job Portal', description: 'Job listings, applications, profiles', icon: 'fas fa-briefcase' },
    { id: 'dating', name: 'Dating', description: 'Profiles, matching, messaging', icon: 'fas fa-heart' },
    { id: 'marketplace', name: 'Marketplace', description: 'Buy/sell, auctions, classifieds', icon: 'fas fa-store' },
    { id: 'booking', name: 'Booking System', description: 'Appointments, reservations, scheduling', icon: 'fas fa-calendar-check' },
    { id: 'crm', name: 'CRM', description: 'Customer relationship management', icon: 'fas fa-handshake' },
    { id: 'erp', name: 'ERP', description: 'Enterprise resource planning', icon: 'fas fa-building' },
    { id: 'project', name: 'Project Management', description: 'Tasks, teams, timelines, collaboration', icon: 'fas fa-tasks' },
    { id: 'analytics', name: 'Analytics', description: 'Data visualization, reports, dashboards', icon: 'fas fa-chart-bar' },
    { id: 'support', name: 'Customer Support', description: 'Tickets, chat, knowledge base', icon: 'fas fa-headset' },
    { id: 'inventory', name: 'Inventory Management', description: 'Stock, orders, suppliers', icon: 'fas fa-boxes' },
    { id: 'hr', name: 'HR Management', description: 'Employees, payroll, attendance', icon: 'fas fa-user-tie' },
    { id: 'accounting', name: 'Accounting', description: 'Invoicing, expenses, financial reports', icon: 'fas fa-calculator' },
    { id: 'legal', name: 'Legal', description: 'Case management, documents, billing', icon: 'fas fa-gavel' },
    { id: 'insurance', name: 'Insurance', description: 'Policies, claims, underwriting', icon: 'fas fa-shield-alt' },
    { id: 'logistics', name: 'Logistics', description: 'Shipping, tracking, delivery', icon: 'fas fa-truck' },
    { id: 'manufacturing', name: 'Manufacturing', description: 'Production, quality control, supply chain', icon: 'fas fa-industry' },
    { id: 'retail', name: 'Retail', description: 'POS, inventory, customer management', icon: 'fas fa-cash-register' },
    { id: 'wholesale', name: 'Wholesale', description: 'B2B sales, bulk orders, pricing', icon: 'fas fa-warehouse' },
    { id: 'subscription', name: 'Subscription', description: 'Recurring billing, plans, usage tracking', icon: 'fas fa-sync' },
    { id: 'membership', name: 'Membership', description: 'Member portal, benefits, renewals', icon: 'fas fa-id-card' },
    { id: 'event', name: 'Event Management', description: 'Events, tickets, attendees, venues', icon: 'fas fa-calendar-alt' },
    { id: 'donation', name: 'Donation Platform', description: 'Fundraising, campaigns, donors', icon: 'fas fa-hand-holding-heart' },
    { id: 'crowdfunding', name: 'Crowdfunding', description: 'Campaigns, backers, rewards', icon: 'fas fa-rocket' },
    { id: 'auction', name: 'Auction', description: 'Bidding, listings, payments', icon: 'fas fa-gavel' },
    { id: 'rental', name: 'Rental Platform', description: 'Property, vehicle, equipment rental', icon: 'fas fa-key' },
    { id: 'freelance', name: 'Freelance Platform', description: 'Gigs, proposals, payments', icon: 'fas fa-laptop-code' },
    { id: 'consulting', name: 'Consulting', description: 'Services, appointments, billing', icon: 'fas fa-user-graduate' },
    { id: 'coaching', name: 'Coaching', description: 'Sessions, progress tracking, payments', icon: 'fas fa-chalkboard-teacher' },
    { id: 'therapy', name: 'Therapy', description: 'Sessions, notes, scheduling', icon: 'fas fa-user-md' },
    { id: 'wellness', name: 'Wellness', description: 'Health tracking, appointments, programs', icon: 'fas fa-spa' },
    { id: 'beauty', name: 'Beauty & Salon', description: 'Appointments, services, products', icon: 'fas fa-cut' },
    { id: 'automotive', name: 'Automotive', description: 'Service booking, parts, repairs', icon: 'fas fa-car' },
    { id: 'pet', name: 'Pet Care', description: 'Veterinary, grooming, boarding', icon: 'fas fa-paw' },
    { id: 'childcare', name: 'Childcare', description: 'Daycare, babysitting, activities', icon: 'fas fa-baby' },
    { id: 'senior', name: 'Senior Care', description: 'Care services, monitoring, family', icon: 'fas fa-wheelchair' },
    { id: 'home', name: 'Home Services', description: 'Cleaning, maintenance, repairs', icon: 'fas fa-tools' },
    { id: 'garden', name: 'Gardening', description: 'Landscaping, plant care, supplies', icon: 'fas fa-seedling' },
    { id: 'photography', name: 'Photography', description: 'Bookings, galleries, prints', icon: 'fas fa-camera' },
    { id: 'music', name: 'Music', description: 'Lessons, events, streaming', icon: 'fas fa-music' },
    { id: 'art', name: 'Art & Design', description: 'Portfolio, commissions, sales', icon: 'fas fa-palette' },
    { id: 'sports', name: 'Sports', description: 'Teams, leagues, tournaments', icon: 'fas fa-football-ball' },
    { id: 'custom', name: 'Custom', description: 'Custom application with specific needs', icon: 'fas fa-cogs' }
  ]

  // API templates based on app type
  const apiTemplates = {
    'ecommerce': [
      { id: 'auth', name: 'Authentication', description: 'User login, register, logout' },
      { id: 'users', name: 'User Management', description: 'User profiles, preferences' },
      { id: 'products', name: 'Products', description: 'Product catalog, search, categories' },
      { id: 'cart', name: 'Shopping Cart', description: 'Add, remove, update cart items' },
      { id: 'orders', name: 'Orders', description: 'Order creation, tracking, history' },
      { id: 'payments', name: 'Payments', description: 'Payment processing, invoices' },
      { id: 'reviews', name: 'Reviews', description: 'Product reviews and ratings' }
    ],
    'finance': [
      { id: 'auth', name: 'Authentication', description: 'Secure login, 2FA, session management' },
      { id: 'users', name: 'User Management', description: 'User profiles, KYC verification' },
      { id: 'accounts', name: 'Accounts', description: 'Bank accounts, balances, transactions' },
      { id: 'transactions', name: 'Transactions', description: 'Transfer, payment, transaction history' },
      { id: 'investments', name: 'Investments', description: 'Portfolio, stocks, bonds management' },
      { id: 'reports', name: 'Reports', description: 'Financial reports, analytics' },
      { id: 'notifications', name: 'Notifications', description: 'Alerts, reminders, updates' }
    ],
    'blog': [
      { id: 'auth', name: 'Authentication', description: 'Author login, user registration' },
      { id: 'users', name: 'User Management', description: 'User profiles, roles' },
      { id: 'posts', name: 'Posts', description: 'Create, edit, delete blog posts' },
      { id: 'categories', name: 'Categories', description: 'Post categorization, tags' },
      { id: 'comments', name: 'Comments', description: 'Post comments, replies' },
      { id: 'media', name: 'Media', description: 'Image upload, gallery management' },
      { id: 'seo', name: 'SEO', description: 'Meta tags, sitemap generation' }
    ],
    'saas': [
      { id: 'auth', name: 'Authentication', description: 'User login, SSO, team management' },
      { id: 'users', name: 'User Management', description: 'User profiles, permissions, roles' },
      { id: 'subscriptions', name: 'Subscriptions', description: 'Plans, billing, usage tracking' },
      { id: 'analytics', name: 'Analytics', description: 'Usage metrics, dashboards' },
      { id: 'integrations', name: 'Integrations', description: 'Third-party API connections' },
      { id: 'notifications', name: 'Notifications', description: 'In-app notifications, emails' },
      { id: 'settings', name: 'Settings', description: 'App configuration, preferences' }
    ],
    'social': [
      { id: 'auth', name: 'Authentication', description: 'User login, social login' },
      { id: 'users', name: 'User Management', description: 'Profiles, friends, followers' },
      { id: 'posts', name: 'Posts', description: 'Create, share, like posts' },
      { id: 'messaging', name: 'Messaging', description: 'Direct messages, group chats' },
      { id: 'notifications', name: 'Notifications', description: 'Real-time notifications' },
      { id: 'media', name: 'Media', description: 'Photo/video upload, stories' },
      { id: 'feed', name: 'Feed', description: 'Timeline, algorithm, discovery' }
    ],
    'education': [
      { id: 'auth', name: 'Authentication', description: 'Student/teacher login' },
      { id: 'users', name: 'User Management', description: 'Students, teachers, admins' },
      { id: 'courses', name: 'Courses', description: 'Course creation, enrollment' },
      { id: 'lessons', name: 'Lessons', description: 'Video, text, assignments' },
      { id: 'quizzes', name: 'Quizzes', description: 'Tests, grading, results' },
      { id: 'progress', name: 'Progress', description: 'Tracking, certificates' },
      { id: 'discussions', name: 'Discussions', description: 'Forums, Q&A' }
    ],
    'healthcare': [
      { id: 'auth', name: 'Authentication', description: 'Secure patient/doctor login' },
      { id: 'users', name: 'User Management', description: 'Patients, doctors, staff' },
      { id: 'records', name: 'Medical Records', description: 'Patient history, documents' },
      { id: 'appointments', name: 'Appointments', description: 'Scheduling, reminders' },
      { id: 'prescriptions', name: 'Prescriptions', description: 'Medication management' },
      { id: 'billing', name: 'Billing', description: 'Insurance, payments' },
      { id: 'telemedicine', name: 'Telemedicine', description: 'Video consultations' }
    ],
    'booking': [
      { id: 'auth', name: 'Authentication', description: 'User login, registration' },
      { id: 'users', name: 'User Management', description: 'Customers, service providers' },
      { id: 'services', name: 'Services', description: 'Service catalog, pricing' },
      { id: 'availability', name: 'Availability', description: 'Time slots, scheduling' },
      { id: 'bookings', name: 'Bookings', description: 'Reservations, confirmations' },
      { id: 'payments', name: 'Payments', description: 'Payment processing' },
      { id: 'notifications', name: 'Notifications', description: 'Reminders, updates' }
    ],
    'project': [
      { id: 'auth', name: 'Authentication', description: 'Team member login' },
      { id: 'users', name: 'User Management', description: 'Team members, roles' },
      { id: 'projects', name: 'Projects', description: 'Project creation, management' },
      { id: 'tasks', name: 'Tasks', description: 'Task assignment, tracking' },
      { id: 'timeline', name: 'Timeline', description: 'Gantt charts, milestones' },
      { id: 'collaboration', name: 'Collaboration', description: 'Comments, file sharing' },
      { id: 'reports', name: 'Reports', description: 'Progress, analytics' }
    ],
    'custom': [
      { id: 'auth', name: 'Authentication', description: 'Basic user authentication' },
      { id: 'users', name: 'User Management', description: 'User profiles and management' },
      { id: 'crud', name: 'CRUD Operations', description: 'Create, read, update, delete data' },
      { id: 'files', name: 'File Management', description: 'File upload, download, storage' },
      { id: 'api', name: 'Custom API', description: 'Custom endpoints for your needs' }
    ]
  }

  // Filter app types based on search query
  const filteredAppTypes = allAppTypes.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAPIToggle = (apiId: string) => {
    setSelectedAPIs(prev => 
      prev.includes(apiId) 
        ? prev.filter(id => id !== apiId)
        : [...prev, apiId]
    )
  }

  const handleConnect = async () => {
    if (!appType) {
      setError('Please select an application type')
      return
    }
    if (selectedAPIs.length === 0) {
      setError('Please select at least one API to connect')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          projectId,
          projectName,
          appType,
          selectedAPIs,
          githubUrl: githubUrl || null
        })
      })

      const result = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        setError(result.message || 'Connection failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && appType) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedAPIs.length > 0) {
      setCurrentStep(3)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Connect to Backend</h2>
          <button className={styles.modalClose} onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.projectInfo}>
            <h3>{projectName}</h3>
            <p>Configure backend APIs for your application</p>
          </div>

          {/* Step 1: App Type Selection */}
          {currentStep === 1 && (
            <div className={styles.step}>
              <h4>Step 1: Select Application Type</h4>
              <div className={styles.searchContainer}>
                <div className={styles.searchInput}>
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search application types (e.g., e-commerce, healthcare, education)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.appTypes}>
                {filteredAppTypes.map(app => (
                  <div 
                    key={app.id}
                    className={`${styles.appType} ${appType === app.id ? styles.selected : ''}`}
                    onClick={() => setAppType(app.id)}
                  >
                    <div className={styles.appTypeIcon}>
                      <i className={app.icon}></i>
                    </div>
                    <div className={styles.appTypeInfo}>
                      <h5>{app.name}</h5>
                      <p>{app.description}</p>
                    </div>
                  </div>
                ))}
                {filteredAppTypes.length === 0 && (
                  <div className={styles.noResults}>
                    <i className="fas fa-search"></i>
                    <p>No frameworks found matching "{searchQuery}"</p>
                    <small>Try a different search term</small>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: API Selection */}
          {currentStep === 2 && (
            <div className={styles.step}>
              <h4>Step 2: Select APIs to Connect</h4>
              <p>Choose which backend APIs you want to inject into your frontend:</p>
              <div className={styles.apiList}>
                {apiTemplates[appType as keyof typeof apiTemplates]?.map(api => (
                  <div 
                    key={api.id}
                    className={`${styles.apiItem} ${selectedAPIs.includes(api.id) ? styles.selected : ''}`}
                    onClick={() => handleAPIToggle(api.id)}
                  >
                    <div className={styles.apiCheckbox}>
                      <input 
                        type="checkbox" 
                        checked={selectedAPIs.includes(api.id)}
                        onChange={() => handleAPIToggle(api.id)}
                      />
                    </div>
                    <div className={styles.apiInfo}>
                      <h5>{api.name}</h5>
                      <p>{api.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: GitHub & Connect */}
          {currentStep === 3 && (
            <div className={styles.step}>
              <h4>Step 3: GitHub Integration (Optional)</h4>
              <div className={styles.formGroup}>
                <label htmlFor="githubUrl">GitHub Repository URL</label>
                <input
                  type="url"
                  id="githubUrl"
                  placeholder="https://github.com/username/repo or git@github.com:username/repo.git"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
                <small>If provided, we'll push the updated code to your repository</small>
              </div>

              <div className={styles.summary}>
                <h5>Connection Summary</h5>
                <div className={styles.summaryItem}>
                  <span>Application Type:</span>
                  <span>{appType.charAt(0).toUpperCase() + appType.slice(1)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Selected APIs:</span>
                  <span>{selectedAPIs.length} APIs</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>GitHub Integration:</span>
                  <span>{githubUrl ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.stepIndicator}>
            Step {currentStep} of 3
          </div>
          <div className={styles.buttonGroup}>
            {currentStep > 1 && (
              <button className={styles.btnSecondary} onClick={prevStep}>
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button 
                className={styles.btnPrimary} 
                onClick={nextStep}
                disabled={!appType || (currentStep === 2 && selectedAPIs.length === 0)}
              >
                Next
              </button>
            ) : (
              <button 
                className={styles.btnPrimary} 
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading"></span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plug"></i>
                    Connect to Backend
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

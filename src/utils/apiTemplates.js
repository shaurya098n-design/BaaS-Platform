// Comprehensive API Templates for Application Types
// This file contains all backend APIs for each app type in the ConnectModal

export const apiTemplates = {
  // E-commerce Application
  ecommerce: {
    name: 'E-commerce',
    description: 'Online store, shopping cart, payments',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'User login, register, logout',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'POST /api/auth/refresh',
          'GET /api/auth/profile',
          'PUT /api/auth/profile',
          'POST /api/auth/forgot-password',
          'POST /api/auth/reset-password'
        ],
        models: ['User', 'Session', 'PasswordReset']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'User profiles, preferences',
        endpoints: [
          'GET /api/users',
          'GET /api/users/:id',
          'PUT /api/users/:id',
          'DELETE /api/users/:id',
          'GET /api/users/:id/addresses',
          'POST /api/users/:id/addresses',
          'PUT /api/users/:id/addresses/:addressId',
          'DELETE /api/users/:id/addresses/:addressId'
        ],
        models: ['User', 'Address', 'UserPreference']
      },
      {
        id: 'products',
        name: 'Products',
        description: 'Product catalog, search, categories',
        endpoints: [
          'GET /api/products',
          'GET /api/products/:id',
          'POST /api/products',
          'PUT /api/products/:id',
          'DELETE /api/products/:id',
          'GET /api/products/search',
          'GET /api/products/categories',
          'POST /api/products/categories',
          'GET /api/products/inventory',
          'PUT /api/products/:id/inventory'
        ],
        models: ['Product', 'Category', 'Inventory', 'ProductImage']
      },
      {
        id: 'cart',
        name: 'Shopping Cart',
        description: 'Add, remove, update cart items',
        endpoints: [
          'GET /api/cart',
          'POST /api/cart/items',
          'PUT /api/cart/items/:itemId',
          'DELETE /api/cart/items/:itemId',
          'DELETE /api/cart/clear',
          'GET /api/cart/count',
          'POST /api/cart/apply-coupon'
        ],
        models: ['Cart', 'CartItem', 'Coupon']
      },
      {
        id: 'orders',
        name: 'Orders',
        description: 'Order creation, tracking, history',
        endpoints: [
          'GET /api/orders',
          'GET /api/orders/:id',
          'POST /api/orders',
          'PUT /api/orders/:id/status',
          'GET /api/orders/:id/tracking',
          'POST /api/orders/:id/cancel',
          'GET /api/orders/analytics'
        ],
        models: ['Order', 'OrderItem', 'OrderStatus', 'Tracking']
      },
      {
        id: 'payments',
        name: 'Payments',
        description: 'Payment processing, invoices',
        endpoints: [
          'POST /api/payments/process',
          'GET /api/payments/:id',
          'POST /api/payments/refund',
          'GET /api/payments/methods',
          'POST /api/payments/methods',
          'GET /api/invoices',
          'GET /api/invoices/:id',
          'POST /api/invoices/:id/send'
        ],
        models: ['Payment', 'PaymentMethod', 'Invoice', 'Refund']
      },
      {
        id: 'reviews',
        name: 'Reviews',
        description: 'Product reviews and ratings',
        endpoints: [
          'GET /api/reviews',
          'GET /api/reviews/product/:productId',
          'POST /api/reviews',
          'PUT /api/reviews/:id',
          'DELETE /api/reviews/:id',
          'POST /api/reviews/:id/like',
          'GET /api/reviews/analytics'
        ],
        models: ['Review', 'Rating', 'ReviewLike']
      }
    ]
  },

  // Finance Application
  finance: {
    name: 'Finance',
    description: 'Banking, investments, financial tracking',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'Secure login, 2FA, session management',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/2fa/verify',
          'POST /api/auth/2fa/setup',
          'POST /api/auth/logout',
          'GET /api/auth/session',
          'POST /api/auth/kyc/verify'
        ],
        models: ['User', 'Session', 'TwoFactorAuth', 'KYC']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'User profiles, KYC verification',
        endpoints: [
          'GET /api/users/profile',
          'PUT /api/users/profile',
          'POST /api/users/kyc/documents',
          'GET /api/users/kyc/status',
          'POST /api/users/kyc/submit',
          'GET /api/users/verification'
        ],
        models: ['User', 'KYCDocument', 'Verification']
      },
      {
        id: 'accounts',
        name: 'Accounts',
        description: 'Bank accounts, balances, transactions',
        endpoints: [
          'GET /api/accounts',
          'GET /api/accounts/:id',
          'POST /api/accounts',
          'GET /api/accounts/:id/balance',
          'GET /api/accounts/:id/transactions',
          'POST /api/accounts/:id/transfer',
          'GET /api/accounts/analytics'
        ],
        models: ['Account', 'Balance', 'Transaction', 'Transfer']
      },
      {
        id: 'transactions',
        name: 'Transactions',
        description: 'Transfer, payment, transaction history',
        endpoints: [
          'GET /api/transactions',
          'GET /api/transactions/:id',
          'POST /api/transactions/transfer',
          'POST /api/transactions/payment',
          'GET /api/transactions/export',
          'GET /api/transactions/categories',
          'POST /api/transactions/categorize'
        ],
        models: ['Transaction', 'Transfer', 'Payment', 'Category']
      },
      {
        id: 'investments',
        name: 'Investments',
        description: 'Portfolio, stocks, bonds management',
        endpoints: [
          'GET /api/investments/portfolio',
          'GET /api/investments/stocks',
          'POST /api/investments/buy',
          'POST /api/investments/sell',
          'GET /api/investments/performance',
          'GET /api/investments/watchlist',
          'POST /api/investments/watchlist'
        ],
        models: ['Portfolio', 'Stock', 'Investment', 'Watchlist']
      },
      {
        id: 'reports',
        name: 'Reports',
        description: 'Financial reports, analytics',
        endpoints: [
          'GET /api/reports/balance-sheet',
          'GET /api/reports/income-statement',
          'GET /api/reports/cash-flow',
          'GET /api/reports/tax',
          'GET /api/reports/export',
          'GET /api/analytics/spending',
          'GET /api/analytics/trends'
        ],
        models: ['Report', 'BalanceSheet', 'IncomeStatement', 'Analytics']
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Alerts, reminders, updates',
        endpoints: [
          'GET /api/notifications',
          'POST /api/notifications/mark-read',
          'GET /api/notifications/settings',
          'PUT /api/notifications/settings',
          'POST /api/notifications/alerts',
          'GET /api/notifications/alerts'
        ],
        models: ['Notification', 'Alert', 'NotificationSettings']
      }
    ]
  },

  // Blog Application
  blog: {
    name: 'Blog',
    description: 'Content management, posts, comments',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'Author login, user registration',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET /api/auth/profile',
          'PUT /api/auth/profile',
          'POST /api/auth/forgot-password'
        ],
        models: ['User', 'Author', 'Session']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'User profiles, roles',
        endpoints: [
          'GET /api/users',
          'GET /api/users/:id',
          'PUT /api/users/:id',
          'GET /api/users/:id/posts',
          'GET /api/users/:id/followers',
          'POST /api/users/:id/follow',
          'DELETE /api/users/:id/follow'
        ],
        models: ['User', 'Author', 'Follower']
      },
      {
        id: 'posts',
        name: 'Posts',
        description: 'Create, edit, delete blog posts',
        endpoints: [
          'GET /api/posts',
          'GET /api/posts/:id',
          'POST /api/posts',
          'PUT /api/posts/:id',
          'DELETE /api/posts/:id',
          'GET /api/posts/featured',
          'GET /api/posts/popular',
          'POST /api/posts/:id/publish',
          'POST /api/posts/:id/unpublish'
        ],
        models: ['Post', 'PostDraft', 'PostStatus']
      },
      {
        id: 'categories',
        name: 'Categories',
        description: 'Post categorization, tags',
        endpoints: [
          'GET /api/categories',
          'GET /api/categories/:id',
          'POST /api/categories',
          'PUT /api/categories/:id',
          'DELETE /api/categories/:id',
          'GET /api/tags',
          'POST /api/tags',
          'GET /api/categories/:id/posts'
        ],
        models: ['Category', 'Tag', 'PostCategory']
      },
      {
        id: 'comments',
        name: 'Comments',
        description: 'Post comments, replies',
        endpoints: [
          'GET /api/comments',
          'GET /api/comments/post/:postId',
          'POST /api/comments',
          'PUT /api/comments/:id',
          'DELETE /api/comments/:id',
          'POST /api/comments/:id/reply',
          'POST /api/comments/:id/like',
          'GET /api/comments/:id/replies'
        ],
        models: ['Comment', 'CommentReply', 'CommentLike']
      },
      {
        id: 'media',
        name: 'Media',
        description: 'Image upload, gallery management',
        endpoints: [
          'POST /api/media/upload',
          'GET /api/media',
          'GET /api/media/:id',
          'DELETE /api/media/:id',
          'GET /api/media/gallery',
          'POST /api/media/gallery',
          'PUT /api/media/gallery/:id'
        ],
        models: ['Media', 'Gallery', 'MediaFile']
      },
      {
        id: 'seo',
        name: 'SEO',
        description: 'Meta tags, sitemap generation',
        endpoints: [
          'GET /api/seo/meta/:postId',
          'PUT /api/seo/meta/:postId',
          'GET /api/seo/sitemap',
          'GET /api/seo/robots',
          'GET /api/seo/analytics',
          'POST /api/seo/optimize'
        ],
        models: ['SEOMeta', 'Sitemap', 'SEOAnalytics']
      }
    ]
  },

  // SaaS Application
  saas: {
    name: 'SaaS',
    description: 'Software as a service, subscriptions',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'User login, SSO, team management',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/sso',
          'POST /api/auth/logout',
          'GET /api/auth/profile',
          'POST /api/auth/invite',
          'GET /api/auth/teams'
        ],
        models: ['User', 'Team', 'Invitation', 'SSO']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'User profiles, permissions, roles',
        endpoints: [
          'GET /api/users',
          'GET /api/users/:id',
          'PUT /api/users/:id',
          'DELETE /api/users/:id',
          'GET /api/users/roles',
          'POST /api/users/roles',
          'PUT /api/users/:id/role',
          'GET /api/users/permissions'
        ],
        models: ['User', 'Role', 'Permission', 'UserRole']
      },
      {
        id: 'subscriptions',
        name: 'Subscriptions',
        description: 'Plans, billing, usage tracking',
        endpoints: [
          'GET /api/subscriptions/plans',
          'GET /api/subscriptions/current',
          'POST /api/subscriptions/subscribe',
          'PUT /api/subscriptions/upgrade',
          'POST /api/subscriptions/cancel',
          'GET /api/subscriptions/usage',
          'GET /api/subscriptions/billing'
        ],
        models: ['Plan', 'Subscription', 'Billing', 'Usage']
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Usage metrics, dashboards',
        endpoints: [
          'GET /api/analytics/dashboard',
          'GET /api/analytics/users',
          'GET /api/analytics/usage',
          'GET /api/analytics/revenue',
          'GET /api/analytics/export',
          'POST /api/analytics/events',
          'GET /api/analytics/reports'
        ],
        models: ['Analytics', 'Dashboard', 'Metric', 'Event']
      },
      {
        id: 'integrations',
        name: 'Integrations',
        description: 'Third-party API connections',
        endpoints: [
          'GET /api/integrations',
          'POST /api/integrations/connect',
          'GET /api/integrations/:id',
          'PUT /api/integrations/:id',
          'DELETE /api/integrations/:id',
          'POST /api/integrations/:id/sync',
          'GET /api/integrations/available'
        ],
        models: ['Integration', 'APIConnection', 'SyncLog']
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'In-app notifications, emails',
        endpoints: [
          'GET /api/notifications',
          'POST /api/notifications/mark-read',
          'GET /api/notifications/settings',
          'PUT /api/notifications/settings',
          'POST /api/notifications/send',
          'GET /api/notifications/templates'
        ],
        models: ['Notification', 'EmailTemplate', 'NotificationSettings']
      },
      {
        id: 'settings',
        name: 'Settings',
        description: 'App configuration, preferences',
        endpoints: [
          'GET /api/settings',
          'PUT /api/settings',
          'GET /api/settings/theme',
          'PUT /api/settings/theme',
          'GET /api/settings/security',
          'PUT /api/settings/security',
          'GET /api/settings/backup'
        ],
        models: ['Settings', 'Theme', 'Security', 'Backup']
      }
    ]
  },

  // Social Media Application
  social: {
    name: 'Social Media',
    description: 'Social networking, messaging, feeds',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'User login, social login',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/social/google',
          'POST /api/auth/social/facebook',
          'POST /api/auth/logout',
          'GET /api/auth/profile'
        ],
        models: ['User', 'SocialAuth', 'Session']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'Profiles, friends, followers',
        endpoints: [
          'GET /api/users/:id',
          'PUT /api/users/:id',
          'GET /api/users/:id/friends',
          'POST /api/users/:id/friend-request',
          'PUT /api/users/friend-request/:id',
          'GET /api/users/:id/followers',
          'POST /api/users/:id/follow',
          'DELETE /api/users/:id/follow'
        ],
        models: ['User', 'Friend', 'Follower', 'FriendRequest']
      },
      {
        id: 'posts',
        name: 'Posts',
        description: 'Create, share, like posts',
        endpoints: [
          'GET /api/posts',
          'GET /api/posts/:id',
          'POST /api/posts',
          'PUT /api/posts/:id',
          'DELETE /api/posts/:id',
          'POST /api/posts/:id/like',
          'POST /api/posts/:id/share',
          'GET /api/posts/feed'
        ],
        models: ['Post', 'PostLike', 'PostShare', 'Feed']
      },
      {
        id: 'messaging',
        name: 'Messaging',
        description: 'Direct messages, group chats',
        endpoints: [
          'GET /api/messages',
          'GET /api/messages/conversations',
          'GET /api/messages/:conversationId',
          'POST /api/messages',
          'POST /api/messages/conversations',
          'PUT /api/messages/:id/read',
          'DELETE /api/messages/:id'
        ],
        models: ['Message', 'Conversation', 'GroupChat']
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Real-time notifications',
        endpoints: [
          'GET /api/notifications',
          'POST /api/notifications/mark-read',
          'GET /api/notifications/unread-count',
          'PUT /api/notifications/settings',
          'GET /api/notifications/settings'
        ],
        models: ['Notification', 'NotificationSettings']
      },
      {
        id: 'media',
        name: 'Media',
        description: 'Photo/video upload, stories',
        endpoints: [
          'POST /api/media/upload',
          'GET /api/media/:id',
          'DELETE /api/media/:id',
          'POST /api/stories',
          'GET /api/stories',
          'GET /api/stories/:id',
          'DELETE /api/stories/:id'
        ],
        models: ['Media', 'Story', 'MediaFile']
      },
      {
        id: 'feed',
        name: 'Feed',
        description: 'Timeline, algorithm, discovery',
        endpoints: [
          'GET /api/feed/timeline',
          'GET /api/feed/discover',
          'GET /api/feed/trending',
          'POST /api/feed/refresh',
          'GET /api/feed/algorithm',
          'PUT /api/feed/preferences'
        ],
        models: ['Feed', 'Timeline', 'Algorithm', 'Trending']
      }
    ]
  },

  // Education Application
  education: {
    name: 'Education',
    description: 'Learning management, courses, quizzes',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'Student/teacher login',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET /api/auth/profile',
          'PUT /api/auth/profile',
          'POST /api/auth/role'
        ],
        models: ['User', 'Student', 'Teacher', 'Session']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'Students, teachers, admins',
        endpoints: [
          'GET /api/users',
          'GET /api/users/:id',
          'PUT /api/users/:id',
          'GET /api/users/students',
          'GET /api/users/teachers',
          'POST /api/users/enroll',
          'GET /api/users/:id/courses'
        ],
        models: ['User', 'Student', 'Teacher', 'Enrollment']
      },
      {
        id: 'courses',
        name: 'Courses',
        description: 'Course creation, enrollment',
        endpoints: [
          'GET /api/courses',
          'GET /api/courses/:id',
          'POST /api/courses',
          'PUT /api/courses/:id',
          'DELETE /api/courses/:id',
          'POST /api/courses/:id/enroll',
          'GET /api/courses/:id/students',
          'GET /api/courses/:id/lessons'
        ],
        models: ['Course', 'Enrollment', 'CourseStudent']
      },
      {
        id: 'lessons',
        name: 'Lessons',
        description: 'Video, text, assignments',
        endpoints: [
          'GET /api/lessons',
          'GET /api/lessons/:id',
          'POST /api/lessons',
          'PUT /api/lessons/:id',
          'DELETE /api/lessons/:id',
          'GET /api/lessons/:id/content',
          'POST /api/lessons/:id/complete',
          'GET /api/lessons/:id/progress'
        ],
        models: ['Lesson', 'LessonContent', 'LessonProgress']
      },
      {
        id: 'quizzes',
        name: 'Quizzes',
        description: 'Tests, grading, results',
        endpoints: [
          'GET /api/quizzes',
          'GET /api/quizzes/:id',
          'POST /api/quizzes',
          'PUT /api/quizzes/:id',
          'DELETE /api/quizzes/:id',
          'POST /api/quizzes/:id/submit',
          'GET /api/quizzes/:id/results',
          'GET /api/quizzes/:id/analytics'
        ],
        models: ['Quiz', 'Question', 'QuizResult', 'QuizAnalytics']
      },
      {
        id: 'progress',
        name: 'Progress',
        description: 'Tracking, certificates',
        endpoints: [
          'GET /api/progress/:userId',
          'GET /api/progress/course/:courseId',
          'GET /api/progress/lesson/:lessonId',
          'POST /api/progress/update',
          'GET /api/certificates',
          'POST /api/certificates/generate',
          'GET /api/certificates/:id'
        ],
        models: ['Progress', 'Certificate', 'ProgressTracking']
      },
      {
        id: 'discussions',
        name: 'Discussions',
        description: 'Forums, Q&A',
        endpoints: [
          'GET /api/discussions',
          'GET /api/discussions/:id',
          'POST /api/discussions',
          'PUT /api/discussions/:id',
          'DELETE /api/discussions/:id',
          'POST /api/discussions/:id/reply',
          'GET /api/discussions/:id/replies',
          'POST /api/discussions/:id/vote'
        ],
        models: ['Discussion', 'DiscussionReply', 'Vote']
      }
    ]
  },

  // Healthcare Application
  healthcare: {
    name: 'Healthcare',
    description: 'Medical records, appointments, telemedicine',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'Secure patient/doctor login',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET /api/auth/profile',
          'POST /api/auth/verify-license',
          'POST /api/auth/patient-verification'
        ],
        models: ['User', 'Patient', 'Doctor', 'License']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'Patients, doctors, staff',
        endpoints: [
          'GET /api/users/patients',
          'GET /api/users/doctors',
          'GET /api/users/staff',
          'GET /api/users/:id',
          'PUT /api/users/:id',
          'GET /api/users/:id/medical-history',
          'POST /api/users/emergency-contact'
        ],
        models: ['User', 'Patient', 'Doctor', 'Staff', 'EmergencyContact']
      },
      {
        id: 'records',
        name: 'Medical Records',
        description: 'Patient history, documents',
        endpoints: [
          'GET /api/records/:patientId',
          'POST /api/records',
          'PUT /api/records/:id',
          'GET /api/records/:id/documents',
          'POST /api/records/documents',
          'GET /api/records/:id/history',
          'POST /api/records/:id/share'
        ],
        models: ['MedicalRecord', 'Document', 'RecordHistory', 'RecordShare']
      },
      {
        id: 'appointments',
        name: 'Appointments',
        description: 'Scheduling, reminders',
        endpoints: [
          'GET /api/appointments',
          'GET /api/appointments/:id',
          'POST /api/appointments',
          'PUT /api/appointments/:id',
          'DELETE /api/appointments/:id',
          'GET /api/appointments/availability',
          'POST /api/appointments/:id/reminder',
          'GET /api/appointments/calendar'
        ],
        models: ['Appointment', 'Availability', 'Reminder', 'Calendar']
      },
      {
        id: 'prescriptions',
        name: 'Prescriptions',
        description: 'Medication management',
        endpoints: [
          'GET /api/prescriptions',
          'GET /api/prescriptions/:id',
          'POST /api/prescriptions',
          'PUT /api/prescriptions/:id',
          'GET /api/prescriptions/:id/medications',
          'POST /api/prescriptions/:id/refill',
          'GET /api/prescriptions/expiring'
        ],
        models: ['Prescription', 'Medication', 'Refill', 'MedicationHistory']
      },
      {
        id: 'billing',
        name: 'Billing',
        description: 'Insurance, payments',
        endpoints: [
          'GET /api/billing/invoices',
          'GET /api/billing/:id',
          'POST /api/billing/invoice',
          'GET /api/billing/insurance',
          'POST /api/billing/insurance/verify',
          'GET /api/billing/payments',
          'POST /api/billing/payment'
        ],
        models: ['Invoice', 'Insurance', 'Payment', 'BillingHistory']
      },
      {
        id: 'telemedicine',
        name: 'Telemedicine',
        description: 'Video consultations',
        endpoints: [
          'POST /api/telemedicine/session',
          'GET /api/telemedicine/session/:id',
          'POST /api/telemedicine/join',
          'GET /api/telemedicine/recordings',
          'POST /api/telemedicine/recording/:id/share',
          'GET /api/telemedicine/availability'
        ],
        models: ['TelemedicineSession', 'Recording', 'SessionParticipant']
      }
    ]
  },

  // Booking System Application
  booking: {
    name: 'Booking System',
    description: 'Appointments, reservations, scheduling',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'User login, registration',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET /api/auth/profile',
          'PUT /api/auth/profile'
        ],
        models: ['User', 'Session']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'Customers, service providers',
        endpoints: [
          'GET /api/users',
          'GET /api/users/:id',
          'PUT /api/users/:id',
          'GET /api/users/customers',
          'GET /api/users/providers',
          'POST /api/users/provider-application',
          'GET /api/users/:id/ratings'
        ],
        models: ['User', 'Customer', 'ServiceProvider', 'Rating']
      },
      {
        id: 'services',
        name: 'Services',
        description: 'Service catalog, pricing',
        endpoints: [
          'GET /api/services',
          'GET /api/services/:id',
          'POST /api/services',
          'PUT /api/services/:id',
          'DELETE /api/services/:id',
          'GET /api/services/categories',
          'POST /api/services/categories',
          'GET /api/services/search'
        ],
        models: ['Service', 'ServiceCategory', 'Pricing']
      },
      {
        id: 'availability',
        name: 'Availability',
        description: 'Time slots, scheduling',
        endpoints: [
          'GET /api/availability/:providerId',
          'POST /api/availability',
          'PUT /api/availability/:id',
          'DELETE /api/availability/:id',
          'GET /api/availability/slots',
          'POST /api/availability/block',
          'GET /api/availability/calendar'
        ],
        models: ['Availability', 'TimeSlot', 'BlockedTime', 'Calendar']
      },
      {
        id: 'bookings',
        name: 'Bookings',
        description: 'Reservations, confirmations',
        endpoints: [
          'GET /api/bookings',
          'GET /api/bookings/:id',
          'POST /api/bookings',
          'PUT /api/bookings/:id',
          'DELETE /api/bookings/:id',
          'POST /api/bookings/:id/confirm',
          'POST /api/bookings/:id/cancel',
          'GET /api/bookings/upcoming'
        ],
        models: ['Booking', 'BookingStatus', 'Confirmation']
      },
      {
        id: 'payments',
        name: 'Payments',
        description: 'Payment processing',
        endpoints: [
          'POST /api/payments/process',
          'GET /api/payments/:id',
          'POST /api/payments/refund',
          'GET /api/payments/methods',
          'POST /api/payments/methods',
          'GET /api/payments/history'
        ],
        models: ['Payment', 'PaymentMethod', 'Refund']
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Reminders, updates',
        endpoints: [
          'GET /api/notifications',
          'POST /api/notifications/mark-read',
          'GET /api/notifications/settings',
          'PUT /api/notifications/settings',
          'POST /api/notifications/reminder',
          'GET /api/notifications/templates'
        ],
        models: ['Notification', 'Reminder', 'NotificationTemplate']
      }
    ]
  },

  // Project Management Application
  project: {
    name: 'Project Management',
    description: 'Tasks, teams, timelines, collaboration',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'Team member login',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET /api/auth/profile',
          'POST /api/auth/invite'
        ],
        models: ['User', 'TeamMember', 'Invitation']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'Team members, roles',
        endpoints: [
          'GET /api/users',
          'GET /api/users/:id',
          'PUT /api/users/:id',
          'GET /api/users/team/:teamId',
          'POST /api/users/team/:teamId/invite',
          'PUT /api/users/:id/role',
          'GET /api/users/roles'
        ],
        models: ['User', 'TeamMember', 'Role', 'TeamInvitation']
      },
      {
        id: 'projects',
        name: 'Projects',
        description: 'Project creation, management',
        endpoints: [
          'GET /api/projects',
          'GET /api/projects/:id',
          'POST /api/projects',
          'PUT /api/projects/:id',
          'DELETE /api/projects/:id',
          'GET /api/projects/:id/members',
          'POST /api/projects/:id/members',
          'GET /api/projects/:id/analytics'
        ],
        models: ['Project', 'ProjectMember', 'ProjectAnalytics']
      },
      {
        id: 'tasks',
        name: 'Tasks',
        description: 'Task assignment, tracking',
        endpoints: [
          'GET /api/tasks',
          'GET /api/tasks/:id',
          'POST /api/tasks',
          'PUT /api/tasks/:id',
          'DELETE /api/tasks/:id',
          'POST /api/tasks/:id/assign',
          'PUT /api/tasks/:id/status',
          'GET /api/tasks/project/:projectId'
        ],
        models: ['Task', 'TaskAssignment', 'TaskStatus']
      },
      {
        id: 'timeline',
        name: 'Timeline',
        description: 'Gantt charts, milestones',
        endpoints: [
          'GET /api/timeline/project/:projectId',
          'POST /api/timeline/milestone',
          'PUT /api/timeline/milestone/:id',
          'DELETE /api/timeline/milestone/:id',
          'GET /api/timeline/gantt/:projectId',
          'POST /api/timeline/dependency',
          'GET /api/timeline/calendar'
        ],
        models: ['Timeline', 'Milestone', 'Dependency', 'GanttChart']
      },
      {
        id: 'collaboration',
        name: 'Collaboration',
        description: 'Comments, file sharing',
        endpoints: [
          'GET /api/comments',
          'POST /api/comments',
          'PUT /api/comments/:id',
          'DELETE /api/comments/:id',
          'POST /api/files/upload',
          'GET /api/files',
          'GET /api/files/:id',
          'DELETE /api/files/:id'
        ],
        models: ['Comment', 'File', 'FileShare']
      },
      {
        id: 'reports',
        name: 'Reports',
        description: 'Progress, analytics',
        endpoints: [
          'GET /api/reports/progress',
          'GET /api/reports/team-performance',
          'GET /api/reports/project-summary',
          'GET /api/reports/time-tracking',
          'GET /api/reports/export',
          'GET /api/analytics/dashboard',
          'GET /api/analytics/trends'
        ],
        models: ['Report', 'ProgressReport', 'Analytics', 'TimeTracking']
      }
    ]
  },

  // Custom Application
  custom: {
    name: 'Custom',
    description: 'Custom application with specific needs',
    apis: [
      {
        id: 'auth',
        name: 'Authentication',
        description: 'Basic user authentication',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET /api/auth/profile',
          'PUT /api/auth/profile'
        ],
        models: ['User', 'Session']
      },
      {
        id: 'users',
        name: 'User Management',
        description: 'User profiles and management',
        endpoints: [
          'GET /api/users',
          'GET /api/users/:id',
          'POST /api/users',
          'PUT /api/users/:id',
          'DELETE /api/users/:id'
        ],
        models: ['User']
      },
      {
        id: 'crud',
        name: 'CRUD Operations',
        description: 'Create, read, update, delete data',
        endpoints: [
          'GET /api/data',
          'GET /api/data/:id',
          'POST /api/data',
          'PUT /api/data/:id',
          'DELETE /api/data/:id'
        ],
        models: ['Data']
      },
      {
        id: 'files',
        name: 'File Management',
        description: 'File upload, download, storage',
        endpoints: [
          'POST /api/files/upload',
          'GET /api/files',
          'GET /api/files/:id',
          'DELETE /api/files/:id',
          'GET /api/files/:id/download'
        ],
        models: ['File']
      },
      {
        id: 'api',
        name: 'Custom API',
        description: 'Custom endpoints for your needs',
        endpoints: [
          'GET /api/custom',
          'POST /api/custom',
          'PUT /api/custom/:id',
          'DELETE /api/custom/:id'
        ],
        models: ['Custom']
      }
    ]
  }
}

// Helper function to get API template by app type
export const getApiTemplate = (appType) => {
  return apiTemplates[appType] || apiTemplates.custom
}

// Helper function to get all available app types
export const getAvailableAppTypes = () => {
  return Object.keys(apiTemplates)
}

// Helper function to get API endpoints for a specific app type
export const getApiEndpoints = (appType) => {
  const template = getApiTemplate(appType)
  return template.apis.flatMap(api => api.endpoints)
}

// Helper function to get data models for a specific app type
export const getDataModels = (appType) => {
  const template = getApiTemplate(appType)
  return template.apis.flatMap(api => api.models)
}

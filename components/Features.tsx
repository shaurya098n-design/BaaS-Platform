'use client'

import styles from './Features.module.css'

const features = [
  {
    icon: 'fas fa-bolt',
    title: 'Instant Deployment',
    description: 'Upload your frontend and get a live, full-stack application in minutes. No configuration needed.'
  },
  {
    icon: 'fas fa-cogs',
    title: 'Auto-Generated APIs',
    description: 'Our AI analyzes your frontend and creates all the backend APIs you need automatically.'
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Secure & Scalable',
    description: 'Built on enterprise-grade infrastructure with automatic scaling and security features.'
  },
  {
    icon: 'fas fa-chart-line',
    title: 'Analytics & Monitoring',
    description: 'Track your app\'s performance with built-in analytics and monitoring tools.'
  },
  {
    icon: 'fas fa-users',
    title: 'User Management',
    description: 'Complete authentication and user management system with role-based access control.'
  },
  {
    icon: 'fas fa-mobile-alt',
    title: 'Mobile Ready',
    description: 'Your apps work perfectly on all devices with responsive design and mobile optimization.'
  }
]

export default function Features() {
  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <h2>Why Choose Our Platform?</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <i className={feature.icon}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


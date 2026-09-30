import { UserButton, useAuth, useUser } from '@clerk/react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api, { configureAxiosAuth } from '../api/axios'

function Dashboard() {
  const { user } = useUser()
  const { getToken } = useAuth()

  const [folderCount, setFolderCount] = useState(0)
  const [documentCount, setDocumentCount] = useState(0)
  const [credentialCount, setCredentialCount] = useState(0)

  const [role, setRole] = useState('')
  const [profile, setProfile] = useState(null)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(null)

  useEffect(() => {
    configureAxiosAuth(getToken)

    const loadDashboardData = async () => {
      try {
        const [
          foldersResponse,
          documentsResponse,
          credentialsResponse,
          profileResponse,
        ] = await Promise.all([
          api.get('/api/folders'),
          api.get('/api/documents'),
          api.get('/api/credentials'),
          api.get('/api/profile'),
        ])

        // Folder count
        setFolderCount(foldersResponse.data.length)

        // Document count
        setDocumentCount(documentsResponse.data.length)

        // Credential count
        setCredentialCount(credentialsResponse.data.length)

        // Profile / role
        console.log('Dashboard role:', profileResponse.data.role)

        setRole(profileResponse.data.role)
        setProfile(profileResponse.data)

        // Trial calculation
        if (
          profileResponse.data.subscription_status === 'TRIAL' &&
          profileResponse.data.trial_end_date
        ) {
          const endDate = new Date(profileResponse.data.trial_end_date)
          const currentDate = new Date()

          const difference = endDate - currentDate

          const daysRemaining = Math.ceil(
            difference / (1000 * 60 * 60 * 24)
          )

          setTrialDaysRemaining(
            daysRemaining > 0 ? daysRemaining : 0
          )
        } else {
          setTrialDaysRemaining(null)
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      }
    }

    loadDashboardData()
  }, [getToken])

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>🔐 Digital Vault</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>

          <Link to="/dashboard/documents">
            Documents
          </Link>

          <Link to="/dashboard/folders">
            Folders
          </Link>

          <Link to="/dashboard/credentials">
            Credentials
          </Link>

          <Link to="/dashboard/profile">
            Profile
          </Link>

          <Link to="/dashboard/settings">
            Settings
          </Link>

          {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <Link to="/dashboard/admin">
              Admin Panel
            </Link>
          )}
        </nav>

        <div
          style={{
            marginTop: 'auto',
            textAlign: 'center',
          }}
        >
          <UserButton />
        </div>
      </aside>

      <main className="dashboard-main">
        <h1>
          Welcome, {user?.firstName || 'User'} 👋
        </h1>

        <p>
          Manage your personal digital information securely.
        </p>

        <p>
          Role: {role || 'Loading...'}
        </p>

        {/* Trial Status */}
        {profile?.subscription_status === 'TRIAL' &&
          profile?.trial_end_date && (
            <div className="trial-card">
              <h3>Free Trial</h3>

              <p>
                Status: <strong>Active</strong>
              </p>

              <p>
                Trial Ends:{' '}
                <strong>
                  {new Date(
                    profile.trial_end_date
                  ).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>
              </p>

              <p>
                Days Remaining:{' '}
                <strong>
                  {trialDaysRemaining ?? 'Calculating...'}
                </strong>
              </p>
            </div>
          )}

        {/* Dashboard Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>📄 Documents</h3>
            <p>{documentCount}</p>
          </div>

          <div className="dashboard-card">
            <h3>📁 Folders</h3>
            <p>{folderCount}</p>
          </div>

          <div className="dashboard-card">
            <h3>🔐 Credentials</h3>
            <p>{credentialCount}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

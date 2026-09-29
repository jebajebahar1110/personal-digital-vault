import { UserButton, useAuth, useUser } from '@clerk/react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api, { configureAxiosAuth } from '../api/axios'

function Dashboard() {
  const { user } = useUser()
  const { getToken } = useAuth()

  const [folderCount, setFolderCount] = useState(0)

  useEffect(() => {
    configureAxiosAuth(getToken)

    const loadFolderCount = async () => {
      try {
        const response = await api.get('/api/folders')
        setFolderCount(response.data.length)
      } catch (err) {
        console.error('Failed to load folder count:', err)
      }
    }

    loadFolderCount()
  }, [getToken])

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>🔐 Digital Vault</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/dashboard/documents">Documents</Link>
          <Link to="/dashboard/folders">Folders</Link>
          <Link to="/dashboard/credentials">Credentials</Link>
          <Link to="/dashboard/profile">Profile</Link>
          <Link to="/dashboard/settings">Settings</Link>
        </nav>

        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
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

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Documents</h3>
            <p>0</p>
          </div>

          <div className="dashboard-card">
            <h3>Folders</h3>
            <p>{folderCount}</p>
          </div>

          <div className="dashboard-card">
            <h3>Credentials</h3>
            <p>0</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
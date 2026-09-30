import { UserButton, useAuth } from '@clerk/react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api, { configureAxiosAuth } from '../api/axios'

function DashboardLayout({ children }) {
  const { getToken } = useAuth()
  const [role, setRole] = useState('')

  useEffect(() => {
    configureAxiosAuth(getToken)

    const loadProfile = async () => {
      try {
        const response = await api.get('/api/profile')
        setRole(response.data.role)
      } catch (err) {
        console.error('Failed to load profile:', err)
      }
    }

    loadProfile()
  }, [getToken])

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>🔐 Digital Vault</h2>

        <nav>
          {role === 'USER' && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/dashboard/documents">Documents</Link>
              <Link to="/dashboard/folders">Folders</Link>
              <Link to="/dashboard/credentials">Credentials</Link>
              <Link to="/dashboard/profile">Profile</Link>
              <Link to="/dashboard/settings">Settings</Link>
            </>
          )}

          {role === 'MANAGER' && (
            <>
              <Link to="/dashboard/manager">Manager Dashboard</Link>
              <Link to="/dashboard/manager">Team / User Overview</Link>
              <Link to="/dashboard/manager">Reports</Link>
              <Link to="/dashboard/profile">Profile</Link>
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <Link to="/dashboard/admin">Admin Dashboard</Link>
              <Link to="/dashboard/admin">User Management</Link>
              <Link to="/dashboard/admin">System Metrics</Link>
              <Link to="/dashboard/admin">Administration</Link>
              <Link to="/dashboard/profile">Profile</Link>
            </>
          )}

          {role === 'SUPER_ADMIN' && (
            <>
              <Link to="/dashboard/super-admin">Super Admin Dashboard</Link>
              <Link to="/dashboard/super-admin">Role Management</Link>
              <Link to="/dashboard/super-admin">System Administration</Link>
              <Link to="/dashboard/super-admin">Security Overview</Link>
              <Link to="/dashboard/profile">Profile</Link>
            </>
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
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
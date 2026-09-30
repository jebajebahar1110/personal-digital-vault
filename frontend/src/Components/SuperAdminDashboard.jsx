import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import api, { configureAxiosAuth } from '../api/axios'
import { useAuth } from '@clerk/react'

function SuperAdminDashboard() {
  const { getToken } = useAuth()

  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    configureAxiosAuth(getToken)

    const loadProfile = async () => {
      try {
        const response = await api.get('/api/profile')
        setRole(response.data.role)
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [getToken])

  if (loading) {
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    )
  }

  if (role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <DashboardLayout>
      <h1>Super Admin Dashboard</h1>

      <p>
        System-level administration and security workspace.
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Role Management</h3>
          <p>
            Role management features will be available when backend APIs are connected.
          </p>
        </div>

        <div className="dashboard-card">
          <h3>System Administration</h3>
          <p>
            System administration features will be available when backend functionality is implemented.
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Security Overview</h3>
          <p>
            Security information will be displayed when backend security APIs are available.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SuperAdminDashboard
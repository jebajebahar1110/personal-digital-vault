import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import api, { configureAxiosAuth } from '../api/axios'
import { useAuth } from '@clerk/react'

function AdminDashboard() {
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

  if (role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <DashboardLayout>
      <h1>Admin Dashboard</h1>

      <p>
        System administration and management workspace.
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>User Management</h3>
          <p>
            User management features will be available when backend APIs are connected.
          </p>
        </div>

        <div className="dashboard-card">
          <h3>System Metrics</h3>
          <p>
            System metrics will be displayed when backend metrics APIs are available.
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Administration</h3>
          <p>
            Administrative controls will be available when backend functionality is implemented.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
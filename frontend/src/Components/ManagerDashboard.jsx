import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import api, { configureAxiosAuth } from '../api/axios'
import { useAuth } from '@clerk/react'

function ManagerDashboard() {
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

  if (role !== 'MANAGER') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <DashboardLayout>
      <h1>Manager Dashboard</h1>

      <p>
        Manager overview and management workspace.
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Team / User Overview</h3>
          <p>Available when management APIs are connected.</p>
        </div>

        <div className="dashboard-card">
          <h3>Reports</h3>
          <p>Reports will be available when backend reporting APIs are added.</p>
        </div>

        <div className="dashboard-card">
          <h3>Profile</h3>
          <p>View your manager account profile.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManagerDashboard
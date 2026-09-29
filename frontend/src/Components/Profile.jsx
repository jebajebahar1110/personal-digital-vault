import { useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import DashboardLayout from './DashboardLayout'
import api, { configureAxiosAuth } from '../api/axios'

function Profile() {
  const { getToken } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    configureAxiosAuth(getToken)

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/api/profile')

        console.log('Profile response:', response.data)

        setProfile(response.data)
      } catch (err) {
        console.error('Failed to load profile:', err)

        setError(
          err.response?.data?.error ||
          'Failed to load profile.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [getToken])

  return (
    <DashboardLayout>
      <h1>Profile</h1>

      {loading && <p>Loading profile...</p>}

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {profile && (
        <div className="profile-card">
          <p>
            <strong>ID:</strong> {profile.id}
          </p>

          <p>
            <strong>Full Name:</strong>{' '}
            {profile.full_name || 'Not available'}
          </p>

          <p>
            <strong>Email:</strong>{' '}
            {profile.email || 'Not available'}
          </p>

          <p>
            <strong>Role:</strong> {profile.role}
          </p>

          <p>
            <strong>Created At:</strong>{' '}
            {profile.created_at}
          </p>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Profile
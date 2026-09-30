import { useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import DashboardLayout from './DashboardLayout'
import api, { configureAxiosAuth } from '../api/axios'

function Credentials() {
  const { getToken } = useAuth()

  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [title, setTitle] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [notes, setNotes] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [visiblePasswords, setVisiblePasswords] = useState({})

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/api/credentials')

      setCredentials(response.data)
    } catch (err) {
      console.error(
        'Failed to load credentials:',
        err
      )

      setError(
        err.response?.data?.error ||
        'Failed to load credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    configureAxiosAuth(getToken)
    fetchCredentials()
  }, [getToken])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !username || !password) {
      setError(
        'Title, username and password are required.'
      )
      return
    }

    try {
      setMessage('')
      setError('')

      const response = await api.post(
        '/api/credentials',
        {
          title,
          username,
          password,
          website_url: websiteUrl,
          notes,
        }
      )

      console.log(
        'Credential created:',
        response.data
      )

      setMessage(
        'Credential saved successfully.'
      )

      setTitle('')
      setUsername('')
      setPassword('')
      setWebsiteUrl('')
      setNotes('')

      await fetchCredentials()
    } catch (err) {
      console.error(
        'Failed to create credential:',
        err
      )

      setError(
        err.response?.data?.error ||
        'Failed to save credential.'
      )
    }
  }

  const handleEditCredential = async (credential) => {
    const newTitle = window.prompt(
      'Enter new title:',
      credential.title
    )

    if (
      newTitle === null ||
      !newTitle.trim()
    ) {
      return
    }

    try {
      setMessage('')
      setError('')

      await api.put(
        `/api/credentials/${credential.id}`,
        {
          title: newTitle,
          username: credential.username,
          website_url: credential.website_url,
          notes: credential.notes,
        }
      )

      setMessage(
        'Credential updated successfully.'
      )

      await fetchCredentials()
    } catch (err) {
      console.error(
        'Failed to update credential:',
        err
      )

      setError(
        err.response?.data?.error ||
        'Failed to update credential.'
      )
    }
  }

  const handleShowPassword = async (id) => {
    try {
      setMessage('')
      setError('')

      const response = await api.get(
        `/api/credentials/${id}/password`
      )

      setVisiblePasswords((prev) => ({
        ...prev,
        [id]: response.data.password,
      }))
    } catch (err) {
      console.error(
        'Failed to get password:',
        err
      )

      setError(
        err.response?.data?.error ||
        'Failed to show password.'
      )
    }
  }

  const handleDeleteCredential = async (id) => {
    try {
      setMessage('')
      setError('')

      await api.delete(`/api/credentials/${id}`)

      setMessage('Credential deleted successfully.')

      await fetchCredentials()
    } catch (err) {
      console.error(
        'Failed to delete credential:',
        err
      )

      setError(
        err.response?.data?.error ||
        'Failed to delete credential.'
      )
    }
  }

  const handleHidePassword = (id) => {
    setVisiblePasswords((prev) => {
      const updated = { ...prev }

      delete updated[id]

      return updated
    })
  }

  const filteredCredentials = credentials.filter(
    (credential) =>
      credential.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <h1>Credentials</h1>

      <p>
        Store and manage your credentials securely.
      </p>

      <form
        className="credential-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <input
          type="url"
          placeholder="https://example.com"
          value={websiteUrl}
          onChange={(e) =>
            setWebsiteUrl(e.target.value)
          }
        />

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
        />

        <button type="submit">
          Save Credential
        </button>
      </form>

      {message && (
        <p style={{ color: 'green' }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <input
        type="text"
        placeholder="🔍 Search credentials..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
      />

      <div className="credential-list">
        {loading ? (
          <p>Loading credentials...</p>
        ) : credentials.length === 0 ? (
          <div className="credential-item">
            <h3>No credentials yet</h3>

            <p>
              Add a credential to see it here.
            </p>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="credential-item">
            <h3>No matching credentials</h3>

            <p>
              No credentials match "{searchTerm}".
            </p>
          </div>
        ) : (
          filteredCredentials.map((credential) => (
            <div
              className="credential-item"
              key={credential.id}
            >
              <h3>{credential.title}</h3>

              <p>
                Username: {credential.username}
              </p>

              <p>
                Website: {credential.website_url}
              </p>

              <p>
                Notes: {credential.notes}
              </p>

              {visiblePasswords[credential.id] && (
                <p>
                  Password:{' '}
                  {visiblePasswords[credential.id]}
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  visiblePasswords[credential.id]
                    ? handleHidePassword(
                        credential.id
                      )
                    : handleShowPassword(
                        credential.id
                      )
                }
              >
                {visiblePasswords[credential.id]
                  ? 'Hide Password'
                  : 'Show Password'}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleEditCredential(
                    credential
                  )
                }
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDeleteCredential(
                    credential.id
                  )
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}

export default Credentials
import { SignIn, SignUp, useAuth } from '@clerk/react'
import { Link, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api, { configureAxiosAuth } from './api/axios'
import './App.css'

function Home() {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authResponse, setAuthResponse] = useState(null)

  useEffect(() => {
    configureAxiosAuth(getToken)
  }, [getToken])

  const testBackendAuthentication = async () => {
    setLoading(true)
    setError('')
    setAuthResponse(null)

    try {
      const response = await api.get('/api/auth-test')
      setAuthResponse(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Backend authentication test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Personal Digital Vault</h1>
      <p>Welcome to Personal Digital Vault</p>

      <div>
        <Link to="/sign-in">Sign In</Link>
        {' | '}
        <Link to="/sign-up">Sign Up</Link>
      </div>

      <button type="button" onClick={testBackendAuthentication}>
        Test Backend Authentication
      </button>

      {loading && <p>Testing authentication...</p>}

      {error && <p>{error}</p>}

      {authResponse && (
        <div>
          <p>Message: {authResponse.message}</p>
          <p>User ID: {authResponse.userId}</p>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/sign-in/*"
        element={<SignIn routing="path" path="/sign-in" />}
      />

      <Route
        path="/sign-up/*"
        element={<SignUp routing="path" path="/sign-up" />}
      />
    </Routes>
  )
}

export default App
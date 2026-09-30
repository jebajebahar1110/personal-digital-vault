import { SignIn, SignUp, useAuth } from '@clerk/react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Dashboard from './Components/Dashboard'
import ManagerDashboard from './Components/ManagerDashboard'
import AdminDashboard from './Components/AdminDashboard'
import SuperAdminDashboard from './Components/SuperAdminDashboard'
import Documents from './Components/Documents'
import Folders from './Components/Folders'
import Credentials from './Components/Credentials'
import Profile from './Components/Profile'
import Settings from './Components/Settings'

import './App.css'

function Home() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/sign-in" replace />
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/sign-in/*"
        element={
          <SignIn
            routing="path"
            path="/sign-in"
          />
        }
      />

      <Route
        path="/sign-up/*"
        element={
          <SignUp
            routing="path"
            path="/sign-up"
          />
        }
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/dashboard/manager"
        element={<ManagerDashboard />}
      />

      <Route
        path="/dashboard/admin"
        element={<AdminDashboard />}
      />

      <Route
        path="/dashboard/super-admin"
        element={<SuperAdminDashboard />}
      />

      <Route
        path="/dashboard/documents"
        element={<Documents />}
      />

      <Route
        path="/dashboard/folders"
        element={<Folders />}
      />

      <Route
        path="/dashboard/credentials"
        element={<Credentials />}
      />

      <Route
        path="/dashboard/profile"
        element={<Profile />}
      />

      <Route
        path="/dashboard/settings"
        element={<Settings />}
      />
    </Routes>
  )
}

export default App
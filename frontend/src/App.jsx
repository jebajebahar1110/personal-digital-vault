import { SignIn, SignUp } from '@clerk/react'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'

function Home() {
  return (
    <div>
      <h1>Personal Digital Vault</h1>
      <p>Welcome to Personal Digital Vault</p>

      <div>
        <Link to="/sign-in">Sign In</Link>
        {' | '}
        <Link to="/sign-up">Sign Up</Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/sign-in"
        element={<SignIn routing="path" path="/sign-in" />}
      />

      <Route
        path="/sign-up"
        element={<SignUp routing="path" path="/sign-up" />}
      />
    </Routes>
  )
}

export default App
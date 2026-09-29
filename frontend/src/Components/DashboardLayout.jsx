import { UserButton } from '@clerk/react'
import { Link } from 'react-router-dom'

function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>🔐 Digital Vault</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>

          <Link to="/dashboard/documents">
            Documents
          </Link>

          <Link to="/dashboard/folders">
            Folders
          </Link>

          <Link to="/dashboard/credentials">
            Credentials
          </Link>

          <Link to="/dashboard/profile">
            Profile
          </Link>

          <Link to="/dashboard/settings">
            Settings
          </Link>
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
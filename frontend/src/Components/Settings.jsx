import DashboardLayout from './DashboardLayout'

function Settings() {
  return (
    <DashboardLayout>
      <h1>Settings</h1>

      <p>
        Manage your digital vault preferences and account settings.
      </p>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>Account Settings</h3>
          <p>Manage your account preferences and personal information.</p>
          <button disabled>Coming Soon</button>
        </div>

        <div className="settings-card">
          <h3>Security</h3>
          <p>Security and authentication preferences for your vault.</p>
          <button disabled>Coming Soon</button>
        </div>

        <div className="settings-card">
          <h3>Notifications</h3>
          <p>Control how you receive important vault notifications.</p>
          <button disabled>Coming Soon</button>
        </div>

        <div className="settings-card">
          <h3>Appearance</h3>
          <p>Customize the appearance of your digital vault.</p>
          <button disabled>Coming Soon</button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Settings
import { useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import DashboardLayout from './DashboardLayout'
import api, { configureAxiosAuth } from '../api/axios'

function Folders() {
  const { getToken } = useAuth()

  const [folders, setFolders] = useState([])
  const [folderName, setFolderName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    configureAxiosAuth(getToken)
    fetchFolders()
  }, [getToken])

  const fetchFolders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/api/folders')

      setFolders(response.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  const createFolder = async (e) => {
    e.preventDefault()

    if (!folderName.trim()) {
      return
    }

    try {
      setError('')

      const response = await api.post('/api/folders', {
        name: folderName,
      })

      setFolders((prev) => [...prev, response.data])

      setFolderName('')
    } catch (err) {
      console.error(err)
      setError('Failed to create folder')
    }
  }

  const startEditing = (folder) => {
    setEditingId(folder.id)
    setEditingName(folder.name)
  }

  const updateFolder = async (id) => {
    if (!editingName.trim()) {
      return
    }

    try {
      setError('')

      const response = await api.put(
        `/api/folders/${id}`,
        {
          name: editingName,
        }
      )

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === id
            ? response.data
            : folder
        )
      )

      setEditingId(null)
      setEditingName('')
    } catch (err) {
      console.error(err)
      setError('Failed to update folder')
    }
  }

  const deleteFolder = async (id) => {
    try {
      setError('')

      await api.delete(`/api/folders/${id}`)

      setFolders((prev) =>
        prev.filter((folder) => folder.id !== id)
      )
    } catch (err) {
      console.error(err)
      setError('Failed to delete folder')
    }
  }

  return (
    <DashboardLayout>
      <h1>Folders</h1>

      <p>
        Organize your documents into folders.
      </p>

      <form
        className="folder-form"
        onSubmit={createFolder}
      >
        <input
          type="text"
          placeholder="Enter folder name"
          value={folderName}
          onChange={(e) =>
            setFolderName(e.target.value)
          }
        />

        <button type="submit">
          Create Folder
        </button>
      </form>

      {loading && <p>Loading folders...</p>}

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <div className="folder-list">
        {folders.map((folder) => (
          <div
            className="folder-item"
            key={folder.id}
          >
            {editingId === folder.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) =>
                    setEditingName(e.target.value)
                  }
                />

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      updateFolder(folder.id)
                    }
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setEditingName('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>
                  📁 {folder.name}
                </span>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      startEditing(folder)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteFolder(folder.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}

export default Folders
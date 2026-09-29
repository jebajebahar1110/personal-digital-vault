import { useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import DashboardLayout from './DashboardLayout'
import api, { configureAxiosAuth } from '../api/axios'

function Documents() {
  const { getToken } = useAuth()

  const [selectedFile, setSelectedFile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchDocuments = async () => {
    try {
      setLoading(true)

      const response = await api.get('/api/documents')

      setDocuments(response.data)
    } catch (err) {
      console.error('Failed to load documents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    configureAxiosAuth(getToken)
    fetchDocuments()
  }, [getToken])

  const handleViewDocument = async (id) => {
    try {
      const response = await api.get(
        `/api/documents/${id}/url`
      )

      const url = response.data.url

      window.open(url, '_blank')
    } catch (err) {
      console.error('Failed to get document URL:', err)

      setError(
        err.response?.data?.error ||
        'Failed to open document.'
      )
    }
  }

  const handleDeleteDocument = async (id) => {
    try {
      setMessage('')
      setError('')

      await api.delete(`/api/documents/${id}`)

      setMessage('Document deleted successfully.')

      await fetchDocuments()
    } catch (err) {
      console.error('Delete failed:', err)

      setError(
        err.response?.data?.error ||
        'Failed to delete document.'
      )
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    setSelectedFile(file)
    setMessage('')
    setError('')
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a document first.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10 MB.')
      return
    }

    try {
      setUploading(true)
      setMessage('')
      setError('')

      const formData = new FormData()

      formData.append('file', selectedFile)

      const response = await api.post(
        '/api/documents',
        formData
      )

      console.log('Upload response:', response.data)

      setMessage(
        `File "${selectedFile.name}" uploaded successfully.`
      )

      setSelectedFile(null)

      await fetchDocuments()
    } catch (err) {
      console.error('Upload failed:', err)

      setError(
        err.response?.data?.error ||
        'Failed to upload document.'
      )
    } finally {
      setUploading(false)
    }
  }

  const filteredDocuments = documents.filter((document) =>
    document.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <h1>Documents</h1>

      <p>Manage your personal documents securely.</p>

      <div className="document-actions">
        <input
          type="file"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading
            ? 'Uploading...'
            : 'Upload Document'}
        </button>
      </div>

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

      {selectedFile && (
        <div className="document-item">
          <h3>Selected Document</h3>

          <p>
            File Name: {selectedFile.name}
          </p>

          <p>
            File Size:{' '}
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}

      <input
        type="text"
        placeholder="🔍 Search documents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="document-list">
        {loading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <div className="document-item">
            <h3>No documents yet</h3>

            <p>
              Upload a document to see it here.
            </p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="document-item">
            <h3>No matching documents</h3>

            <p>
              No documents match "{searchTerm}".
            </p>
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <div
              className="document-item"
              key={document.id}
            >
              <div>
                <h3>{document.name}</h3>

                <p>
                  Size:{' '}
                  {(document.file_size / 1024).toFixed(2)} KB
                </p>

                <p>
                  Type: {document.file_type}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handleViewDocument(document.id)
                  }
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteDocument(document.id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}

export default Documents

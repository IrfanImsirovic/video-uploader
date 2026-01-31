import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { uploadVideo } from '../api/videos'
import { getApiErrorMessage } from '../api/errors'
import './UploadPage.css'

export default function UploadPage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [file, setFile] = useState(null)

  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toNiceError = (err) => {
    const status = err?.response?.status
    if (status === 413) {
      return 'Upload failed: file too large. Try a smaller video, or increase the upload limit in the server.'
    }

    const data = err?.response?.data
    if (data?.fieldErrors) {
      return getApiErrorMessage(err, 'Upload failed')
    }

    const msg = data?.message ?? data

    if (typeof msg === 'string') {
      const trimmed = msg.trim()
      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<HTML')) {
        return 'Upload failed: server returned an HTML error page (likely a reverse-proxy limit).'
      }
      return trimmed || 'Upload failed'
    }

    return 'Upload failed'
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setProgress(0)

    if (!file) {
      setError('Please choose a video file.')
      return
    }
    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    setLoading(true)
    try {
      const data = await uploadVideo({
        file,
        title: title.trim(),
        description: description.trim() || undefined,
        isPrivate,
        onUploadProgress: (evt) => {
          if (!evt.total) return
          setProgress(Math.round((evt.loaded / evt.total) * 100))
        },
      })
      navigate(`/videos/${data.id}`)
    } catch (err) {
      setError(toNiceError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '28px 0 48px' }}>
      <div className="panel">
        <h1 style={{ margin: 0, color: '#14141a' }}>Upload video</h1>
        <p style={{ marginTop: 6, opacity: 0.75 }}>
          Choose a file, set title/description, and decide if it’s private.
        </p>

        <form onSubmit={onSubmit}>
          <div className="field">
            <div className="label">Video file</div>
            <input
              className="input"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="help">Supported: any browser-playable format (mp4 recommended).</div>
          </div>

          <div className="field">
            <div className="label">Title</div>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="field">
            <div className="label">Description (optional)</div>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
              Private
            </label>
            <span className="help">Private videos are only visible to you.</span>
          </div>

          {error && <div className="error" style={{ marginTop: 12 }}>
            {error}
          </div>}

          {loading && (
            <div style={{ marginTop: 12 }}>
              Uploading… {progress}%
              <div
                style={{
                  height: 8,
                  background: 'rgba(0,0,0,0.08)',
                  borderRadius: 999,
                  overflow: 'hidden',
                  marginTop: 6,
                }}
              >
                <div style={{ width: `${progress}%`, height: '100%', background: 'rgba(92, 64, 189, 0.9)' }} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

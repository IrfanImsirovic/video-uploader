import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { fetchThumbnailBlob, fetchVideoBlob, getVideo } from '../api/videos'
import './VideoPage.css'

function PrivateBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        background: 'rgba(255, 231, 203, 0.9)',
        color: '#7a4b00',
        border: '1px solid rgba(255, 216, 168, 0.9)',
      }}
    >
      <span aria-hidden="true">🔒</span>
      Private
    </span>
  )
}

export default function VideoPage() {
  const { id } = useParams()

  const [video, setVideo] = useState(null)
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [error, setError] = useState('')

  const [videoUrl, setVideoUrl] = useState('')
  const [thumbUrl, setThumbUrl] = useState('')
  const [loadingMedia, setLoadingMedia] = useState(false)

  const prettyDate = useMemo(() => {
    if (!video?.createdAt) return ''
    try {
      const d = new Date(video.createdAt)
      return d.toLocaleString()
    } catch {
      return String(video.createdAt)
    }
  }, [video])

  useEffect(() => {
    let cancelled = false
    setLoadingMeta(true)
    setError('')
    setVideo(null)

    async function run() {
      try {
        const data = await getVideo(id)
        if (!cancelled) setVideo(data)
      } catch (e) {
        const status = e?.response?.status
        if (status === 403) {
          setError('This video is private (owner only).')
        } else if (status === 404) {
          setError('Video not found.')
        } else {
          const msg = e?.response?.data?.message || e?.response?.data || 'Failed to load video'
          setError(String(msg))
        }
      } finally {
        if (!cancelled) setLoadingMeta(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    let nextVideoUrl = ''
    let nextThumbUrl = ''

    async function run() {
      if (!video) return
      setLoadingMedia(true)
      try {
        const tb = await fetchThumbnailBlob(video.id)
        nextThumbUrl = URL.createObjectURL(tb)
        if (!cancelled) setThumbUrl(nextThumbUrl)

        const vb = await fetchVideoBlob(video.id)
        nextVideoUrl = URL.createObjectURL(vb)
        if (!cancelled) setVideoUrl(nextVideoUrl)
      } catch (e) {
        const status = e?.response?.status
        if (!cancelled) {
          if (status === 403) {
            setError('You do not have access to this video.')
          } else if (status === 404) {
            setError('Thumbnail or video file not found.')
          } else {
            setError('Failed to load media (thumbnail/video).')
          }
        }
      } finally {
        if (!cancelled) setLoadingMedia(false)
      }
    }

    run()

    return () => {
      cancelled = true
      if (nextVideoUrl) URL.revokeObjectURL(nextVideoUrl)
      if (nextThumbUrl) URL.revokeObjectURL(nextThumbUrl)
      setVideoUrl('')
      setThumbUrl('')
    }
  }, [video])

  return (
    <div style={{ padding: '28px 0 48px' }}>
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className="title">{loadingMeta ? 'Loading…' : video?.title ?? 'Video'}</h1>
            {video && (
              <div className="meta">
                <span className="sub">by {video.uploaderUsername}</span>
                {video.isPrivate && <PrivateBadge />}
                {prettyDate && <span className="sub">• {prettyDate}</span>}
              </div>
            )}
          </div>
          <div>
            <Link to="/" style={{ color: '#4b2ab2', fontWeight: 700 }}>
              ← Back
            </Link>
          </div>
        </div>

        {video?.description && <p style={{ marginTop: 10, opacity: 0.85 }}>{video.description}</p>}
        {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}

        {!error && (
          <>
            <video className="video" controls src={videoUrl || undefined} poster={thumbUrl || undefined} />
            {loadingMedia && <div style={{ marginTop: 10, opacity: 0.8 }}>Loading media…</div>}
          </>
        )}
      </div>
    </div>
  )
}

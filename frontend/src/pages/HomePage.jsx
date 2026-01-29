import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { listVideos } from '../api/videos'
import VideoThumbnail from '../components/VideoThumbnail.jsx'

function PrivateBadge() {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        background: '#fff4e5',
        color: '#7a4b00',
        border: '1px solid #ffd8a8',
      }}
    >
      Private
    </span>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const debounceRef = useRef(null)

  const title = useMemo(() => {
    return query ? `Search results for "${query}"` : 'Latest videos'
  }, [query])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError('')
      try {
        const data = await listVideos(query)
        if (!cancelled) setVideos(Array.isArray(data) ? data : [])
      } catch (e) {
        const msg = e?.response?.data?.message || e?.response?.data || 'Failed to load videos'
        if (!cancelled) setError(String(msg))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [query])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    const trimmed = input.trim()
    if (!trimmed) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await listVideos(trimmed)
        setSuggestions((Array.isArray(data) ? data : []).slice(0, 8))
      } catch {
        setSuggestions([])
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input])

  const onSubmit = (e) => {
    e.preventDefault()
    setQuery(input.trim())
    setShowSuggestions(false)
  }

  const onPickSuggestion = (video) => {
    setShowSuggestions(false)
    navigate(`/videos/${video.id}`)
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <h1 style={{ margin: '0 0 12px' }}>Video Uploader</h1>

      <div style={{ position: 'relative', maxWidth: 640 }}>
        <form onSubmit={onSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search videos..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd' }}
          />
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 46,
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: 10,
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            {suggestions.map((v) => (
              <button
                key={v.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPickSuggestion(v)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600 }}>{v.title}</span>
                  {v.isPrivate && <PrivateBadge />}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{v.uploaderUsername}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <h2 style={{ marginTop: 20 }}>{title}</h2>

      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {loading && <div>Loading…</div>}

      {!loading && videos.length === 0 && <div>No videos found.</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
          marginTop: 12,
        }}
      >
        {videos.map((v) => (
          <Link
            key={v.id}
            to={`/videos/${v.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid #eee',
              borderRadius: 12,
              padding: 12,
              display: 'grid',
              gap: 10,
            }}
          >
            <VideoThumbnail videoId={v.id} alt={v.title} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontWeight: 700, lineHeight: 1.2 }}>{v.title}</div>
              {v.isPrivate && <PrivateBadge />}
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>by {v.uploaderUsername}</div>
            {v.description && (
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                {v.description.length > 90 ? `${v.description.slice(0, 90)}…` : v.description}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
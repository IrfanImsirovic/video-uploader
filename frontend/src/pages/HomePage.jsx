import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import { listVideos } from '../api/videos'
import VideoThumbnail from '../components/VideoThumbnail.jsx'
import './HomePage.css'

function PrivateBadge() {
  return (
    <span className="privateBadge" title="Private" aria-label="Private">
      <span className="lock" aria-hidden="true">
        🔒
      </span>
    </span>
  )
}

function formatPublished(dateLike) {
  if (!dateLike) return ''
  try {
    return new Date(dateLike).toLocaleDateString()
  } catch {
    return ''
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const debounceRef = useRef(null)
  const listRequestInFlightRef = useRef(false)

  
  useEffect(() => {
    if (location.pathname === '/' && location.state?.clearSearch) {
      setInput('')
      setQuery('')
    }
  }, [location])

  const title = useMemo(() => {
    return query ? `Search results for "${query}"` : 'Latest videos'
  }, [query])

  useEffect(() => {
    let cancelled = false


    const POLL_MS = 5000

    async function run({ showLoading } = { showLoading: true }) {
      if (listRequestInFlightRef.current) return
      listRequestInFlightRef.current = true

      if (showLoading) setLoading(true)
      setError('')
      try {
        const data = await listVideos(query)
        if (!cancelled) setVideos(Array.isArray(data) ? data : [])
      } catch (e) {
        const msg = e?.response?.data?.message || e?.response?.data || 'Failed to load videos'
        if (!cancelled) setError(String(msg))
      } finally {
        listRequestInFlightRef.current = false
        if (!cancelled && showLoading) setLoading(false)
      }
    }

    run({ showLoading: true })

    const intervalId = window.setInterval(() => {
      run({ showLoading: false })
    }, POLL_MS)

    const onMaybeRefresh = () => {
      if (document.visibilityState !== 'visible') return
      run({ showLoading: false })
    }

    window.addEventListener('focus', onMaybeRefresh)
    document.addEventListener('visibilitychange', onMaybeRefresh)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onMaybeRefresh)
      document.removeEventListener('visibilitychange', onMaybeRefresh)
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
    <div className="home">
      <section className="hero">
        <h1 className="heroTitle">Latest Videos</h1>
        <p className="heroSubtitle">Discover and watch amazing content</p>

        <div className="searchWrap">
          <form onSubmit={onSubmit}>
            <input
              className="searchInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search videos..."
            />
          </form>

          <button
            type="button"
            onClick={onSubmit}
            className="searchIcon"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%' }}>
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.2 16.2 21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className="suggestionBtn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPickSuggestion(v)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700 }}>{v.title}</span>
                    {v.isPrivate && <PrivateBadge />}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.65 }}>{v.uploaderUsername}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sectionTitle">{title}</div>

        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        {loading && <div>Loading…</div>}
        {!loading && videos.length === 0 && <div>No videos found.</div>}

        <div className="grid">
          {videos.map((v) => (
            <Link key={v.id} to={`/videos/${v.id}`} className="cardLink">
              <div className="card">
                <div className="thumbWrap">
                  <VideoThumbnail videoId={v.id} alt={v.title} />
                </div>

                <div className="cardBody">
                  <div className="cardTitleRow">
                    <div className="cardTitle" title={v.title}>
                      {v.title}
                    </div>
                    {v.isPrivate && <PrivateBadge />}
                  </div>

                  <div className="cardMeta">
                    <span className="metaUser">👤 by {v.uploaderUsername}</span>
                    <span className="metaDate">📆 {formatPublished(v.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
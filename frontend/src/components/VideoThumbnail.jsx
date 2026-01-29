import { useEffect, useState } from 'react'
import { fetchThumbnailBlob } from '../api/videos'

export default function VideoThumbnail({ videoId, alt, width = 240, height = 135 }) {
  const [src, setSrc] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    let objectUrl = ''

    async function run() {
      setError(false)
      setSrc('')
      try {
        const blob = await fetchThumbnailBlob(videoId)
        objectUrl = URL.createObjectURL(blob)
        if (active) setSrc(objectUrl)
      } catch {
        if (active) setError(true)
      }
    }

    run()

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [videoId])

  if (error) {
    return (
      <div
        style={{
          width,
          height,
          background: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 8,
          display: 'grid',
          placeItems: 'center',
          color: '#7a1f1f',
          fontSize: 12,
        }}
      >
        Thumbnail missing
      </div>
    )
  }

  if (!src) {
    return (
      <div
        style={{
          width,
          height,
          background: '#eee',
          borderRadius: 8,
        }}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{ width, height, objectFit: 'cover', borderRadius: 8, display: 'block' }}
    />
  )
}

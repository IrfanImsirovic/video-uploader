import api from './client'

export async function listVideos(search) {
  const res = await api.get('/videos', {
    
    params: search ? { search, _ts: Date.now() } : { _ts: Date.now() },
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  })
  return res.data
}

export async function getVideo(id) {
  const res = await api.get(`/videos/${id}`)
  return res.data
}

export async function fetchThumbnailBlob(id) {
  const res = await api.get(`/videos/${id}/thumbnail`, { responseType: 'blob' })
  return res.data
}

export async function fetchVideoBlob(id) {
  const res = await api.get(`/videos/${id}/download`, { responseType: 'blob' })
  return res.data
}

export async function uploadVideo({ file, title, description, isPrivate, onUploadProgress }) {
  const form = new FormData()
  form.append('file', file)
  form.append('title', title)
  if (description) form.append('description', description)
  form.append('private', String(Boolean(isPrivate)))

  const res = await api.post('/videos/upload', form, {
    onUploadProgress,
  })
  return res.data
}

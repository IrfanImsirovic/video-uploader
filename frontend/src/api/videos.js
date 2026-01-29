import api from './client'

export async function listVideos(search) {
  const res = await api.get('/videos', {
    params: search ? { search } : undefined,
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

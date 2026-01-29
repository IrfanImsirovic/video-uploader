import axios from 'axios'

function getStoredToken() {
  try {
    const raw = localStorage.getItem('vu_auth')
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.token ?? null
  } catch {
    return null
  }
}

const api = axios.create({
  baseURL: '/api',
})

const token = getStoredToken()
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export function setAuthToken(nextToken) {
  if (nextToken) {
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export default api

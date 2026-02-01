import api from './client'

export async function signUp({ username, email, password }) {
  const res = await api.post('/auth/signup', { username, email, password })
  return res.data
}

export async function signIn({ username, password }) {
  const res = await api.post('/auth/signin', { username, password })
  return res.data
}

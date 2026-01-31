export function getApiErrorMessage(err, fallback = 'Request failed') {
  const data = err?.response?.data

  if (data && typeof data === 'object') {
    const fieldErrors = data.fieldErrors
    if (fieldErrors && typeof fieldErrors === 'object') {
      const msgs = Object.values(fieldErrors).filter(Boolean)
      if (msgs.length) return msgs.join(' • ')
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim()
    }
  }

  if (typeof data === 'string' && data.trim()) {
    return data.trim()
  }

  return fallback
}

export function getApiFieldErrors(err) {
  const data = err?.response?.data
  const fieldErrors = data?.fieldErrors

  if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
    return fieldErrors
  }

  return null
}

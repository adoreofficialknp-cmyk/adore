import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adore_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const hadToken = localStorage.getItem('adore_token')
      localStorage.removeItem('adore_token')
      localStorage.removeItem('adore_user')
      // Only redirect to /login if the user was previously authenticated
      // (token expired / invalidated). Guests without a token should NOT
      // be redirected — their 401s are expected and handled per-component.
      if (hadToken) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

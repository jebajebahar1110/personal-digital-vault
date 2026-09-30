import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
})

let interceptorId = null

export const configureAxiosAuth = (getToken) => {
  if (interceptorId !== null) {
    api.interceptors.request.eject(interceptorId)
  }

  interceptorId = api.interceptors.request.use(async (config) => {
    const token = await getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })
}

export default api
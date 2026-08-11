import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://smart-shop-backend-2v5t.onrender.com/api/v1'
    : '/api/v1',
  withCredentials: true
})

export default api
import axios from "axios"


 const baseURL= import.meta.env.VITE_API_URL || "http://192.168.1.43:5000/api"

export const userAPI = axios.create({ baseURL })
userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const adminAPI = axios.create({ baseURL })
adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default userAPI


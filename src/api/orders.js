import {userAPI, adminAPI} from "./axios"

export const placeOrder = (data) => userAPI.post("/orders", data)

export const fetchOrders = () => adminAPI.get("/orders")

export const fetchOrderById = (id) => adminAPI.get(`/orders/${id}`)

export const fetchMyOrders = () => userAPI.get("/orders/my-orders")

export const updateOrderStatus = (id, status) =>
  adminAPI.put(`/orders/${id}/status`, { status })

export const fetchOrderInvoice = (id) =>
  adminAPI.get(`/orders/${id}/invoice`, { responseType: "blob" })

export const emailOrderInvoice = (id) =>
  adminAPI.post(`/orders/${id}/invoice/email`)

export const cancelOrder = (id) => userAPI.put(`/orders/${id}/cancel`)

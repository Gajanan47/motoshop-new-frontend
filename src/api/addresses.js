import { userAPI } from "./axios"

export const fetchMyAddresses = () => userAPI.get("/addresses")
export const addAddress = (data) => userAPI.post("/addresses", data)
export const deleteAddress = (id) => userAPI.delete(`/addresses/${id}`)
export const setDefaultAddress = (id) => userAPI.put(`/addresses/${id}/default`)
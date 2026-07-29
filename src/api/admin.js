import {adminAPI} from "./axios"

// admin login
export const adminLogin = (data) => adminAPI.post("/admin/login", data)
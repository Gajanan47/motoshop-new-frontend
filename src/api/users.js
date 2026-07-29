import {userAPI} from "./axios"

export const fetchMe = ()=> userAPI.get("/users/me")

export const verifyPassword = (password) => 
    userAPI.post("/users/verify-password" , {password})

export const changePassword = ( newPassword) => 
    userAPI.put("/users/change-password", {newPassword})
export const updateProfile = (data) => userAPI.put('/users/me', data)
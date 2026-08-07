import { userAPI } from "./axios"

export const bookTestDrive = (data) => userAPI.post("/test-drives", data)

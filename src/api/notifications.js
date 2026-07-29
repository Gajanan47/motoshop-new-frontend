import {userAPI, adminAPI} from './axios'

export const fetchUserNotifications = ()=> userAPI.get('/notifications/user')
export const fetchAdminNotifications = ()=> adminAPI.get('/notifications/admin')

export const markUserNotificationRead = (id) => userAPI.put(`/notifications/user/${id}/read`)
export const markAllUserNotificationsRead = () => userAPI.put('/notifications/user/read-all')
export const clearUserNotifications = () => userAPI.delete('/notifications/user/clear')

export const markAdminNotificationRead = (id) => adminAPI.put(`/notifications/admin/${id}/read`)
export const markAllAdminNotificationsRead = () => adminAPI.put('/notifications/admin/read-all')
export const clearAdminNotifications = () => adminAPI.delete('/notifications/admin/clear')

import {userAPI} from './axios'

export const addComment = (data) => userAPI.post('/add-comment', data) 
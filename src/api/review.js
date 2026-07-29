import {userAPI} from "./axios";

export const getReviews = (productId) =>  userAPI.get(`/reviews/${productId}`)

export const addReviews = (productId, data) => userAPI.post(`/reviews/${productId}`, data)

export const deleteReview = (productId) => userAPI.delete(`/reviews/${productId}`)
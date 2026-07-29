import { userAPI } from "./axios";

export const addWishlist = (productId) =>
  userAPI.post("/wishlist", { productId });

export const removeWishlist = (productId) =>
  userAPI.delete(`/wishlist/${productId}`);

export const getWishlist = () =>
  userAPI.get("/wishlist");
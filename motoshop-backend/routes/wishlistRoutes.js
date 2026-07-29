const express = require("express");
const router = express.Router();

const {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} = require("../controllers/wishlistController");

const {verifyUser} = require("../middleware/authMiddleware")
router.post("/", verifyUser, addToWishlist);
router.get("/", verifyUser, getWishlist);
router.delete("/:productId", verifyUser, removeFromWishlist);
router.get("/wishlist", verifyUser, getWishlist)

module.exports = router;
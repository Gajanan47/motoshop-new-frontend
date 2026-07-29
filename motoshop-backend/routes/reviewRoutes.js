const express = require('express')
const router = express.Router()
const{getReviews, addReviews, deleteReview} = require('../controllers/reviewController')
const{verifyUser} = require('../middleware/authMiddleware')
router.get("/:productId", verifyUser, getReviews)
router.post("/:productId/", verifyUser, addReviews)
router.delete("/:productId", verifyUser, deleteReview)

module.exports = router
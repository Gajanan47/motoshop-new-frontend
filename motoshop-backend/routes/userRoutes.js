const express = require("express")
const router = express.Router()

const {
  registerUser,
  loginUser,
  getMe,
  verifyPassword, 
  updateProfile,
  changePassword
} = require("../controllers/userController")

const { verifyUser } = require("../middleware/authMiddleware")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/me", verifyUser, getMe)
router.post("/verify-password", verifyUser, verifyPassword)
router.put('/me', verifyUser, updateProfile)
router.put('/change-password', verifyUser, changePassword)
module.exports = router
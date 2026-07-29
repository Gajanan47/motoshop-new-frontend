const express = require("express")
const router = express.Router()
const { adminLogin, createAdmin } = require("../controllers/adminController")

// POST /api/admin/login
router.post("/login", adminLogin)

// POST /api/admin/create
// protected by secret key inside controller
router.post("/create", createAdmin)

module.exports = router
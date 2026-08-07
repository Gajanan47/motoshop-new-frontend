const express = require("express")
const { createTestDrive } = require("../controllers/testDriveController")

const router = express.Router()

router.post("/", createTestDrive)

module.exports = router

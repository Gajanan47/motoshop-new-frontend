const express = require("express")
const router = express.Router()
const { getMyAddresses, addAddress, deleteAddress, setDefaultAddress } = require("../controllers/addressController")
const { verifyUser } = require("../middleware/authMiddleware")

router.get("/", verifyUser, getMyAddresses)
router.post("/", verifyUser, addAddress)
router.delete("/:id", verifyUser, deleteAddress)
router.put("/:id/default", verifyUser, setDefaultAddress)

module.exports = router
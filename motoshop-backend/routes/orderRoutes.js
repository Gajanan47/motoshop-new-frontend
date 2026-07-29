const express = require("express")
const router = express.Router()
const {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrderInvoice,
  emailOrderInvoice,
  getMyOrders,
  
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController")
const { verifyAdmin, verifyUser } = require("../middleware/authMiddleware")

// PUBLIC — customer places order after payment
router.post("/", verifyUser, placeOrder)

// PROTECTED — admin only
router.get("/", verifyAdmin, getAllOrders)
router.get("/my-orders", verifyUser, getMyOrders )
router.get("/:id/invoice", verifyAdmin, getOrderInvoice)
router.post("/:id/invoice/email", verifyAdmin, emailOrderInvoice)
router.get("/:id", verifyAdmin, getOrderById)
router.put("/:id/status", verifyAdmin, updateOrderStatus)
router.put("/:id/cancel", verifyUser, cancelOrder)

module.exports = router

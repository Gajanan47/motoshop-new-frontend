const express = require("express")
const router = express.Router()
const {
    getUserNotifications,
    getAdminNotifications,
    markUserNotificationRead,
    markAllUserNotificationsRead,
    clearUserNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    clearAdminNotifications,
} = require("../controllers/notificationController")
const { verifyUser } = require("../middleware/authMiddleware")
const { verifyAdmin } = require("../middleware/authMiddleware")

router.get("/user", verifyUser, getUserNotifications)
router.put("/user/read-all", verifyUser, markAllUserNotificationsRead)
router.put("/user/:id/read", verifyUser, markUserNotificationRead)
router.delete("/user/clear", verifyUser, clearUserNotifications)

router.get("/admin", verifyAdmin, getAdminNotifications)
router.put("/admin/read-all", verifyAdmin, markAllAdminNotificationsRead)
router.put("/admin/:id/read", verifyAdmin, markAdminNotificationRead)
router.delete("/admin/clear", verifyAdmin, clearAdminNotifications)

module.exports = router
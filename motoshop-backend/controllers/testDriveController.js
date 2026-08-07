const db = require("../config/db")
const { createNotification } = require("./notificationController")

const createTestDrive = async (req, res) => {
  try {
    const { productId, name, phone, date, timeSlot, showroom } = req.body
    const bookingDate = new Date(`${date}T00:00:00`)

    if (!productId || !name?.trim() || !phone?.trim() || !date || !timeSlot || !showroom) {
      return res.status(400).json({ success: false, message: "Please complete every booking field." })
    }
    if (Number.isNaN(bookingDate.getTime()) || bookingDate <= new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({ success: false, message: "Please choose a future date for your test ride." })
    }

    const [[product]] = await db.query("SELECT id, name FROM products WHERE id = ?", [productId])
    if (!product) return res.status(404).json({ success: false, message: "Vehicle not found." })

    const [result] = await db.query(
      `INSERT INTO test_drive_bookings (product_id, customer_name, customer_phone, booking_date, time_slot, showroom)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product.id, name.trim(), phone.trim(), date, timeSlot, showroom]
    )

    try {
      await createNotification({
        recipientRole: "admin",
        title: "New test ride request",
        message: `${name.trim()} requested ${product.name} on ${date} at ${timeSlot}. Phone: ${phone.trim()}.`,
      })
    } catch (notificationError) {
      console.log("Test ride notification failed:", notificationError.message)
    }

    res.status(201).json({ success: true, data: { id: result.insertId } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { createTestDrive }

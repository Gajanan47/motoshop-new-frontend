const db = require("../config/db")
const path = require("path")
const { generateInvoice } = require("../invoicegenerator.js")
const { createNotification } = require("./notificationController")
const { sendCustomerEmail, sendAdminEmail, sendCustomerStatusChangeEmail, sendAdminStatusUpdate } = require("../utils/sendEmail")
// POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      items,
      total,
      gst
    } = req.body

    // validate required fields
    if (!customerName || !customerEmail || !customerPhone || !items || !total) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    // generate unique order ID
    const orderId = "#MTS-" + Math.floor(100000 + Math.random() * 900000)
    const userId = req.user.id
    // save order to database
    await db.query(
      `INSERT INTO orders 
        (order_id, customer_name, customer_email, customer_phone, delivery_address, items, total, gst, status, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        JSON.stringify(items),  // convert array to JSON string for MySQL
        total,
        gst,
        "Confirmed",
        userId
      ]
    )
    const invoiceFileName = `${orderId.replace('#', "")}.pdf`
    const invoicePath = path.join(__dirname, "..", "invoices", invoiceFileName)

    await generateInvoice({
      orderId, customerName, customerEmail, customerPhone, deliveryAddress, items, total, gst, createdAt: new Date()
    }, invoicePath)

    // send emails — don't crash the order if email fails
    try {
      await sendCustomerEmail(customerEmail, customerName, {
        orderId, items, total, gst, invoicePath
      })
      await sendAdminEmail({
        orderId, customerName, customerEmail,
        customerPhone, items, total, gst, invoicePath
      })
    } catch (emailError) {
      console.log("Email sending failed:", emailError.message)
      // order still succeeds even if email fails
    }
    const invoiceUrl = `/invoices/${invoiceFileName}`

    

    try {
      await Promise.all([
        createNotification({
          recipientRole: 'user',
          userId,
          title: "Order Confirmed",
          message: `Your order ${orderId} has been confirmed.`
        }),
        createNotification({
          recipientRole: 'admin',
          title: "Order Confirmed",
          message: `${customerName} has confirmed ${orderId} order.`
        }),
      ])
      
    } catch (notifyError) {
      console.log("Notification creation failed:", notifyError.message)
      // order already succeeded and response already sent — don't let this crash anything
    }
res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId,
      invoiceUrl
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    )
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params

    const [rows] = await db.query(
      "SELECT * FROM orders WHERE id = ?", [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    // mysql2 already parses the JSON `items` column automatically
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getInvoicePath = (orderId) => {
  const invoiceFileName = `${orderId.replace("#", "")}.pdf`
  return {
    invoiceFileName,
    invoicePath: path.join(__dirname, "..", "invoices", invoiceFileName)
  }
}

const getOrderInvoice = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT order_id FROM orders WHERE id = ?", [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    const { invoiceFileName, invoicePath } = getInvoicePath(rows[0].order_id)
    if (!require("fs").existsSync(invoicePath)) {
      return res.status(404).json({ success: false, message: "Invoice is not available for this order" })
    }

    return res.download(invoicePath, invoiceFileName)
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const emailOrderInvoice = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    const order = rows[0]
    const { invoicePath } = getInvoicePath(order.order_id)
    if (!require("fs").existsSync(invoicePath)) {
      return res.status(404).json({ success: false, message: "Invoice is not available for this order" })
    }

    await sendCustomerEmail(order.customer_email, order.customer_name, {
      orderId: order.order_id,
      items: order.items || [],
      total: Number(order.total || 0),
      gst: Number(order.gst || 0),
      invoicePath
    })

    return res.json({ success: true, message: `Invoice sent to ${order.customer_email}` })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to send invoice email" })
  }
}
// PUT update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    //admin only
    const { id } = req.params
    const { status } = req.body
    const validStatuses = ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      })
    }

    const [existing] = await db.query(
      "SELECT * FROM orders WHERE id = ?", [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    await db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, id]
    )
    const order = existing[0]
    res.json({ success: true, message: "Order status updated" })
    try {
      await Promise.all([
        createNotification({
          recipientRole: "user",
          userId: order.user_id,
          orderId: order.id,
          title: "Order status updated",
          message: `Your order ${order.order_id} is now ${status}.`
        }),
        createNotification({
          recipientRole: "admin",
          orderId: order.id,
          title: "Order status updated",
          message: `Order ${order.order_id} was changed to ${status}.`
        })
      ])
    } catch (notifyError) {
      console.log("Notification creation failed:", notifyError.message)
    }
    Promise.all([
      sendCustomerStatusChangeEmail(order.customer_email, order.customer_name, {
        orderId: order.order_id,
        status
      }),
      sendAdminStatusUpdate({
        orderId: order.order_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        status
      })


    ]).catch((emailError) => {
      console.log("Status update email failed:", emailError.message)
    })




  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
const getMyOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]
    )
    res.json({ success: true, data: rows })
  }
  catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const cancelOrder = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? AND id = ?", [req.user.id, req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    const order = rows[0]
    const nonCancellable = ['Shipped', 'Delivered', 'Cancelled']

    if (nonCancellable.includes(order.status)) {
      return res.status(200).json({
        success: false, message: `This order no longer be cancelled (status : ${order.status}`
      })
    }
    await db.query(
      'UPDATE orders SET status = ? WHERE id=?  ', ['Cancelled', req.params.id]
    )
    

    try {
      await Promise.all([
        createNotification({
          recipientRole: 'user',
          userId: req.user.id,
          orderId: order.id,
          title: "Order Cancelled",
          message: `You cancelled order ${order.order_id}.`
        }),
        createNotification({
          recipientRole: 'admin',
          orderId: order.id,
          title: "Order Cancelled",
          message: ` ${order.customer_name} has cancelled the ${order.order_id} order. `
        }),

      ])
      res.json({ success: true, message: "Order has been cancelled" })
    } catch (notifyError) {
      console.log("Notification creation failed:", notifyError.message)
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { placeOrder, getAllOrders, updateOrderStatus, getOrderById, getOrderInvoice, emailOrderInvoice, getMyOrders, cancelOrder }
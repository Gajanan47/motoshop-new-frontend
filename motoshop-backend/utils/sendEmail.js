const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config()

// create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
})

// send order confirmation to customer
const sendCustomerEmail = async (customerEmail, customerName, orderDetails) => {
  const { orderId, items, total, gst, invoicePath } = orderDetails

  const itemsList = items.map(item =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.company}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">Qty: ${item.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">₹${(item.price * item.qty).toFixed(2)}L</td>
    </tr>`
  ).join("")

  const mailOptions = {
    from: `"MotoShop" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Confirmed — ${orderId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <div style="background:#f97316;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">MOTO<span>SHOP</span></h1>
        </div>

        <div style="padding:24px">
          <h2>Hi ${customerName}, your order is confirmed! 🎉</h2>
          <p style="color:#666">Thank you for your purchase. Our team will contact you within 24 hours to arrange delivery.</p>

          <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:20px 0">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <h3>Order Summary</h3>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f1f1f1">
                <th style="padding:8px;text-align:left">Vehicle</th>
                <th style="padding:8px;text-align:left">Brand</th>
                <th style="padding:8px;text-align:left">Qty</th>
                <th style="padding:8px;text-align:left">Price</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>

          <div style="margin-top:16px;text-align:right">
            <p>Subtotal: <strong>₹${total.toFixed(2)}L</strong></p>
            <p>GST (18%): <strong>₹${gst.toFixed(2)}L</strong></p>
            <p style="font-size:18px">Total Paid: <strong style="color:#f97316">₹${(total + gst).toFixed(2)}L</strong></p>
          </div>

          <p style="margin-top:24px;color:#666;font-size:13px">
            If you have any questions, reply to this email or contact us at support@motoshop.com
          </p>
        </div>
      </div>
    `,
    attachments: invoicePath ? [{
      filename: `invoice-${orderId.replace("#", "")}.pdf`,
      path: invoicePath
    }] : []

  }

  await transporter.sendMail(mailOptions)
}

// send notification to admin
const sendAdminEmail = async (orderDetails) => {
  const { orderId, customerName, customerEmail, customerPhone, items, total, gst, invoicePath } = orderDetails

  const itemsList = items.map(item =>
    `<li>${item.name} (${item.company}) — Qty ${item.qty} — ₹${(item.price * item.qty).toFixed(2)}L</li>`
  ).join("")

  const mailOptions = {
    from: `"MotoShop System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Order Received — ${orderId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#f97316">New Order Received!</h2>

        <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
        </div>

        <h3>Items Ordered:</h3>
        <ul>${itemsList}</ul>

        <div style="margin-top:16px">
          <p>Subtotal: <strong>₹${total.toFixed(2)}L</strong></p>
          <p>GST: <strong>₹${gst.toFixed(2)}L</strong></p>
          <p>Total: <strong style="color:#f97316">₹${(total + gst).toFixed(2)}L</strong></p>
        </div>
      </div>
    `,
    attachments: invoicePath ? [{
      filename: `invoice-${orderId.replace("#", "")}.pdf`,
      path: invoicePath
    }] : []
  }

  await transporter.sendMail(mailOptions)
}

const sendCustomerStatusChangeEmail= async(customer_email, customer_name, orderDetails) =>{
  const {orderId, status } = orderDetails;

  const statusMessages = {
    Confirmed : "Your order has been confirmed and is being prepared",
    Processing: "Your order is being processed",
    Shipped : "Your order has been shipped - it is on it's way!",
    Delivered : "Congratulations !, your order has been delivered.",
    Cancelled : "Your order has been cancelled, if any questions contact us"
  }
  const statusColors = {
    Confirmed: "#2563eb",
    Processing: "#ca8a04",
    Shipped: "#9333ea",
    Delivered: "#16a34a",
    Cancelled: "#dc2626",
  }
  const mailOptions = {
    from : `"MOTOSHOP" <${process.env.EMAIL_USER}>`,
    to : customer_email,
    subject : `Order Update - ${orderId} is now ${status}`,
    html : `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <div style="background:#f97316;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">MOTO<span>SHOP</span></h1>
        </div>
 
        <div style="padding:24px">
          <h2>Hi ${customer_name
          }, your order status has been updated</h2>
 
          <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:20px 0">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p>
              <strong>New Status:</strong>
              <span style="color:${statusColors[status] || "#666"};font-weight:bold">${status}</span>
            </p>
          </div>
 
          <p style="color:#666">${statusMessages[status] || ""}</p>
 
          <p style="margin-top:24px;color:#666;font-size:13px">
            If you have any questions, reply to this email or contact us at support@motoshop.com
          </p>
        </div>
      </div>
    `
  }
  await transporter.sendMail(mailOptions)
}

const sendAdminStatusUpdate = async(orderDetails) => {
  const {order_id, customer_name, customer_email, status} = orderDetails
  const mailOptions = {
    from : `"MotoShop System" <${process.env.EMAIL_USER}>`,
    to : process.env.EMAIL_USER,
    subject : `Order ${order_id} status has changed to ${status}`, 
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#f97316">Order Status Updated</h2>
 
        <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0">
          <p><strong>Order ID:</strong> ${order_id}</p>
          <p><strong>Customer:</strong> ${customer_name} (${customer_email})</p>
          <p><strong>New Status:</strong> ${status}</p>
          <p><strong>Changed at:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `
  }
  await transporter.sendMail(mailOptions)
}

module.exports = { sendCustomerEmail, sendAdminEmail,sendAdminStatusUpdate, sendCustomerStatusChangeEmail }

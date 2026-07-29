const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")




dotenv.config()

const app = express()

app.use(cors({
    
    origin:
    ["http://localhost:5173", "http://127.0.0.1:5173", "http://192.168.1.43:5173"],
    credentials: true
}))
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
const productRoutes = require("./routes/productRoutes")
const orderRoutes = require("./routes/orderRoutes")
const adminRoutes = require("./routes/adminRoutes")
const userRoutes = require('./routes/userRoutes')
const chatbotRoutes = require('./routes/chatbotRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const wishlistRoutes = require("./routes/wishlistRoutes");
const notificationRoutes = require("./routes/notificationRoutes")
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/addresses", require("./routes/addressRoutes"))
app.use("/invoices", express.static(path.join(__dirname, "invoices")))

app.use("/api/chatbot", require("./routes/chatbotRoutes"))
app.use("/api/reviews", reviewRoutes)
app.use("/api/wishlist",wishlistRoutes);
app.use("/api/notifications", notificationRoutes)
app.get('/', (req, res) => {
    res.json({ message: "MotoShop backend is running" })
})
app.use("/api/users",userRoutes)
const PORT = process.env.PORT || '5000'
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`)
})

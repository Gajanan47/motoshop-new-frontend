const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()

const verifyAdmin = (req, res, next) => {
  try {
    // get token from request header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      })
    }

    // extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1]

    // verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // check role is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied — admins only"
      })
    }

    // attach admin info to request
    req.admin = decoded

    // pass to next function (the controller)
    next()

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    })
  }
}
const verifyUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== "user") {
      return res.status(403).json({ success: false, message: "Users only" })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" })
  }
}

module.exports = { verifyAdmin, verifyUser }

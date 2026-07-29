const db = require("../config/db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()

// POST /api/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      })
    }

    // find admin by email
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    const admin = rows[0]

    // compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    // create JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }  // token valid for 7 days
    )

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/admin/create
// run this ONCE to create your admin account
const createAdmin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body

    // extra protection — only allow if secret key matches
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        message: "Invalid secret key"
      })
    }

    // check if admin already exists
    const [existing] = await db.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists"
      })
    }

    // hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10)

    await db.query(
      "INSERT INTO admins (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    )

    res.status(201).json({
      success: true,
      message: "Admin created successfully"
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { adminLogin, createAdmin }
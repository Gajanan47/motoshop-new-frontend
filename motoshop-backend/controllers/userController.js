const db = require("../config/db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")


dotenv.config()

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      })
    }

    const [existing] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.query(
      "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, phone || null]
    )

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      })
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: "user"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE id = ?",
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    res.json({
      success: true,
      data: rows[0]
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      })
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const user = rows[0]

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      })
    }

    res.json({
      success: true,
      message: "Password verified"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      })
    }

    await db.query(
      "UPDATE users SET name = ?, phone = ? WHERE id = ?",
      [name, phone || null, req.user.id]
    )

    res.json({ success: true, message: "Profile updated" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body

    if ( !newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password are required"
      })
    }

    if (newPassword.length < 10 || newPassword.length > 10) {
      return res.status(400).json({
        success: false,
        message: "New password must be of 10 characters"
      })
    }

    const [rows] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req.user.id]
    )

    res.json({
      success: true,
      message: "Password changed successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  verifyPassword,
  updateProfile,
  changePassword
}
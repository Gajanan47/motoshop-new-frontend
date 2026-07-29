const db = require("../config/db")

const getMyAddresses = async (req, res) =>{
    try{
        const [rows] = await db.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC' , [req.user.id])
        res.json({success: true, data: rows})
    } catch (err){
        res.status(500).json({success: false, message: err.message})
    }
}

const addAddress = async (req, res) => {
  try {
    const { full_name, phone, address_line, city, state, pincode, is_default } = req.body

    if (!full_name || !phone || !address_line || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    if (is_default) {
      await db.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [req.user.id])
    }

    await db.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, full_name, phone, address_line, city, state, pincode, !!is_default]
    )

    res.status(201).json({ success: true, message: "Address added" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const deleteAddress = async (req, res) => {
  try {
    await db.query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id])
    res.json({ success: true, message: "Address deleted" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const setDefaultAddress = async (req, res) => {
  try {
    await db.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [req.user.id])
    await db.query(
      "UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    )
    res.json({ success: true, message: "Default address updated" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getMyAddresses, addAddress, deleteAddress, setDefaultAddress }
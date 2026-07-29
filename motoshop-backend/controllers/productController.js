const db = require("../config/db")

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
const geminiModel = "gemini-3.5-flash"

const getVehicleType = (type) => {
  if (String(type) === "2") return "Two-wheeler"
  if (String(type) === "4") return "Four-wheeler"
  return "Vehicle"
}

const generateDescription = async (req, res) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const { name, company, type, cc, fuel, use_case, price } = req.body

    if (!name || !company) {
      return res.status(400).json({
        success: false,
        message: "Name and company are required to generate a description"
      })
    }

    if (!geminiApiKey) {
      return res.status(500).json({ success: false, message: "Gemini API key is missing" })
    }

    const details = [
      `${name} is a ${getVehicleType(type)} made by ${company}.`,
      cc ? `It has a ${cc}cc engine.` : null,
      fuel ? `It runs on ${fuel}.` : null,
      use_case ? `It's best suited for ${use_case} use.` : null,
      price ? `It's priced around Rs ${price} lakh.` : null,
    ].filter(Boolean).join(" ")

    const prompt = `
Write a product description for an e-commerce vehicle listing.

Facts about the vehicle:
${details}

Rules:
- Output ONLY the final description text — nothing else.
- Do not repeat these instructions, do not explain your reasoning, do not restate the facts as a list.
- Do not use labels like "Name:" or "Brand:", markdown, asterisks, or bullet points.
- Write 2-3 flowing sentences, like real ad copy a shopper would read on a product page.
- Do not invent specifications, features, or numbers beyond what's given above.

Example of the style and format expected (different vehicle, for reference only):
"The Hero Splendor Plus is a dependable commuter bike built for everyday city rides. With a fuel-efficient 97cc engine, it delivers smooth performance at an accessible price point, making it a practical choice for daily commuting."

Now write the description for the vehicle described above, in that same style:
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationConfig: { temperature: 0.6, maxOutputTokens: 200 },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    )

    const data = await response.json()
    console.log(response)
    console.log("data",data)
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error?.message || "Gemini request failed",
      })
    }

    const rawDescription = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || "Could not generate a description right now."

    // strip stray markdown asterisks, leading labels, or wrapping quotes the model might still add
    const description = rawDescription
      .replace(/\*\*/g, "")
      .replace(/^["']|["']$/g, "")
      .replace(/^(Name|Description)\s*:\s*/i, "")
      .trim()

    res.json({ success: true, description })
  } catch (err) {
    console.error("Description generation error:", err)
    if (err.name === "AbortError") {
      return res.status(504).json({ success: false, message: "Gemini took too long to respond. Please try again." })
    }
    res.status(500).json({ success: false, message: "Failed to generate description" })
  } finally {
    clearTimeout(timeout)
  }
}

const getAllProducts = async(req,res)=>{
    try{
        // instead of SELECT * FROM products
const [rows] = await db.query(`
  SELECT p.*, 
    JSON_ARRAYAGG(pi.url) as images
  FROM products p
  LEFT JOIN product_images pi ON p.id = pi.product_id
  GROUP BY p.id
`)
        res.json({success:true,data:rows})
    }catch(err){
        res.status(500).json({success:false,message:err.message})
    }
}

const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query(`
  SELECT p.*, 
    JSON_ARRAYAGG(pi.url) as images
  FROM products p
  LEFT JOIN product_images pi ON p.id = pi.product_id
  WHERE p.id = ?
  GROUP BY p.id
`, [id])

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    res.json({ success: true, data: rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

function buildImages(req) {
  const uploadBase = `${req.protocol}://${req.get("host")}/uploads`
  const uploaded = (req.files || []).map((file) => `${uploadBase}/${file.filename}`)

  let bodyImages = []
  if (req.body.images) {
    if (Array.isArray(req.body.images)) {
      bodyImages = req.body.images.filter(Boolean)
    } else if (typeof req.body.images === "string") {
      bodyImages = req.body.images ? [req.body.images] : []
    }
  }

  return [...bodyImages, ...uploaded]
}

const addProduct = async (req, res) => {
  try {
    const { name, company, type, cc, fuel, use_case,
            price, rating, reviews, badge, description } = req.body
    const images = buildImages(req)
    // images = array of URLs from frontend e.g. ["url1", "url2"]

    if (!name || !company || !type || !price)
      return res.status(400).json({
        success: false,
        message: "name, company, type and price are required"
      })
    const image = images?.[0] || null
    const [result] = await db.query(
      `INSERT INTO products
        (name, company, type, cc, fuel, use_case, price, rating, reviews, badge, description, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, company, type, cc || 0, fuel, use_case,
       price, rating || 0, reviews || 0, badge || "", description || "", image]
    )

    const productId = result.insertId

    // insert images into product_images table
    if (images && images.length > 0) {
      const imageRows = images.map((url, i) => [productId, url, i])
      await db.query(
        "INSERT INTO product_images (product_id, url, sort_order) VALUES ?",
        [imageRows]
      )
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      productId
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { name, company, type, cc, fuel,
            use_case, price, rating, reviews, badge, description } = req.body

    const [existing] = await db.query("SELECT * FROM products WHERE id = ?", [id])
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: "Product not found" })

    const images = buildImages(req)

    await db.query(
      `UPDATE products SET
        name=?, company=?, type=?, cc=?, fuel=?,
        use_case=?, price=?, rating=?, reviews=?, badge=?, description=?, image=?
       WHERE id=?`,
      [name, company, type, cc, fuel, use_case, price, rating, reviews, badge,
       description ?? existing[0].description, images?.[0] || existing[0].image, id]
    )

    // replace old images with new ones
    if (images && images.length > 0) {
      await db.query("DELETE FROM product_images WHERE product_id = ?", [id])
      const imageRows = images.map((url, i) => [id, url, i])
      await db.query(
        "INSERT INTO product_images (product_id, url, sort_order) VALUES ?",
        [imageRows]
      )
    }

    res.json({ success: true, message: "Product updated successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE product (admin only)
// Route: DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    // check product exists first
    const [existing] = await db.query("SELECT * FROM products WHERE id = ?", [id])
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    await db.query("DELETE FROM products WHERE id = ?", [id])
    res.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getSimilarProducts = async (req, res) => {
  try{
    const {id} = req.params
    const [product] = await db.query("SELECT * FROM products WHERE id=?", [id])
    if(product.length == 0){
      return res.status(404).json({
        success:false, message:"Product not found"
      })  
    } 
    const current = product[0]
    const [rows] = await db.query(`SELECT p.*, JSON_ARRAYAGG(pi.url) AS images 
      FROM products p
      LEFT JOIN product_images pi 
      ON p.id = pi.product_id
      WHERE p.id != ?
      AND 
     ( p.company = ? OR p.type = ? OR p.fuel = ?) 
      GROUP BY p.id 
      ORDER BY (p.company = ?) DESC, 
      (p.type=?) DESC,
      ABS(p.price - ?) ASC LIMIT 8 `, [id, current.company, current.type, current.fuel, current.company, current.type, current.price])

      res.json({success: true, data:rows})
  }
  catch(err){
    res.status(500).json({success: false, message:err.message})
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getSimilarProducts,
  generateDescription
}
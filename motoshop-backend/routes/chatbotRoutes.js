const express = require("express")
const db = require("../config/db")

const router = express.Router()
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
const geminiModel = "gemini-3.5-flash"

const mainPrompt = `
You are MotoShop AI, a professional and friendly assistant for an e-commerce website that sells two-wheelers and four-wheelers.

Your responsibilities are:
- Help users choose the right vehicle.
- Recommend products based on budget, vehicle type, mileage, fuel type, brand, seating capacity, and purpose.
- Compare vehicles by highlighting pros and cons.
- Answer questions about specifications, features, maintenance, servicing, financing, and buying decisions.
- Explain technical terms in simple language.
- When product information is provided, recommend only from that MotoShop inventory.
- If the required information is not available, politely say you don't have enough information instead of making up facts.
- Be concise, accurate, and helpful.
- Format responses using bullet points whenever appropriate.
- Never provide harmful, offensive, or illegal advice.
- Do not answer unrelated questions such as politics, medical advice, hacking, or personal opinions. Politely respond:
  "I'm MotoShop AI and can help you with vehicles, products, and services available on MotoShop."

User Query:
`;

const getVehicleType = (type) => {
  if (String(type) === "2") return "Two-wheeler"
  if (String(type) === "4") return "Four-wheeler"
  return "Vehicle"
}

const formatProductsForPrompt = (products) => {
  if (!products.length) {
    return "No MotoShop products are currently available in the database."
  }

  return products
    .map((product, index) => {
      const details = [
        `${index + 1}. ${product.name}`,
        `brand: ${product.company}`,
        `type: ${getVehicleType(product.type)}`,
        product.cc ? `cc: ${product.cc}` : null,
        product.fuel ? `fuel: ${product.fuel}` : null,
        product.use_case ? `use: ${product.use_case}` : null,
        product.price ? `price: Rs ${product.price}L` : null,
        product.rating ? `rating: ${product.rating}` : null,
        product.reviews ? `reviews: ${product.reviews}` : null,
        product.badge ? `badge: ${product.badge}` : null,
      ].filter(Boolean)

      return details.join(", ")
    })
    .join("\n")
}

router.post("/", async (req, res) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(),10000)

  try {
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      })
    }

    if (!geminiApiKey) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is missing",
      })
    }

    const [products] = await db.query(`
      SELECT id, name, company, type, cc, fuel, use_case, price, rating, reviews, badge
      FROM products
      ORDER BY id DESC
      LIMIT 40
    `)

    const prompt = `
${mainPrompt}

MotoShop Inventory:
${formatProductsForPrompt(products)}

User Query:
${message}
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500,
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error?.message || "Gemini request failed",
      })
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I could not generate a response right now."

    res.json({
      success: true,
      response: answer,
    })
  } catch (err) {
    console.error("Chatbot error:", err)
    if (err.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message: "Gemini took too long to respond. Please try again.",
      })
    }

    res.status(500).json({
      success: false,
      message: "Chatbot server error",
    })
  } finally {
    clearTimeout(timeout)
  }
})

module.exports = router

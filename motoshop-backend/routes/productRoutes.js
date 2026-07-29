const express = require("express")
const router = express.Router()
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getSimilarProducts,
  generateDescription
} = require("../controllers/productController")
const { upload } = require("../middleware/uploadMiddleware")

const { verifyAdmin } = require("../middleware/authMiddleware")

// PUBLIC routes — anyone can access
router.get("/", getAllProducts)
router.get("/similar/:id", getSimilarProducts )
router.get("/:id", getProductById)

// PROTECTED routes — admin only
router.post("/", verifyAdmin, upload.array("images", 5), addProduct)
router.post("/generate-description", verifyAdmin, generateDescription)
router.put("/:id", verifyAdmin, upload.array("images", 5), updateProduct)
router.delete("/:id", verifyAdmin, deleteProduct)


module.exports = router
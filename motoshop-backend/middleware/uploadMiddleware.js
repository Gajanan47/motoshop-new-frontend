const multer = require("multer")
const fs = require("fs")
const {CloudinaryStorage} = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")
const path = require("path")

const storage = CloudinaryStorage({
  cloudinary, 
  params : {
    folder: "/motoshop-backend/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
})



const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

module.exports = { upload }

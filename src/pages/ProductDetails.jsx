import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchProducts, getSimilarProducts } from '../api/products'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useCompare } from '../context/CompareContext'
import SimilarProducts from '../components/SimilarProducts'
import ReviewSection from '../components/ReviewSection'
import { getSpecFields } from "../utils/vehicleSpecs"
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaShoppingBag } from 'react-icons/fa'
import {
  MdCompareArrows,
  MdChevronRight,
  MdCheckCircle,
  MdLocalShipping,
  MdVerifiedUser,
  MdArrowForward,
  MdBolt,
  MdLocalGasStation,
  MdSportsMotorsports
} from 'react-icons/md'
// import { GiMotorcycle } from 'react-icons/gi'
import CompareTray from "../components/CompareTray"
const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { addToCart, cart, removeFromCart } = useCart()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const { isInCompare, toggleCompare } = useCompare()

  const [product, setProduct] = useState()
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [similarProducts, setSimilarProducts] = useState([])
  const [zoom, setzoom] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const cartItem = product ? cart.find((item) => item.id === product.id) : null
  const qty = cartItem ? cartItem.qty : 0
  const isWishlisted = product ? wishlistIds.has(product.id) : false
  const isComparing = product ? isInCompare(product.id) : false

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetchProducts()
        const found = res.data.data.find((p) => p.id === Number(id))
        setProduct(found)
        setSelectedImage(found?.image)

        const similar = await getSimilarProducts(id)
        setSimilarProducts(similar.data.data)
      } catch (err) {
        console.log('Error loading product:', err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    window.scrollTo(0, 0)
  }, [id])

  const handleWishlist = () => {
    if (!localStorage.getItem('userToken')) {
      navigate('/login')
      return
    }
    toggleWishlist(product)
  }

  const handleBuyNow = () => {
    navigate('/checkout', { state: { buyNowItem: { ...product, qty: 1 } } })
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f7f9fb]">
        <p className="text-[#434655] font-medium">Loading vehicle details…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f7f9fb]">
        <p className="text-red-500 font-medium">Product not found.</p>
      </div>
    )
  }

  const images = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : []

  // Highlight tiles — only rendered when the product actually has the data.
  const highlights = [
    product.cc > 0 && { icon: <MdBolt />, label: 'Engine', value: `${product.cc} CC` },
    product.fuel && { icon: <MdLocalGasStation />, label: 'Fuel Type', value: product.fuel },
    product.use_case && { icon: <MdSportsMotorsports />, label: 'Vehicle Type', value: product.use_case },
  ].filter(Boolean)

  const ratingValue = Number(product.rating) || 0
  const stars = [1, 2, 3, 4, 5].map((n) =>
    n <= Math.round(ratingValue) ? (
      <FaStar key={n} className="text-[#9d4300] text-[14px]" />
    ) : (
      <FaRegStar key={n} className="text-[#c3c6d7] text-[14px]" />
    )
  )
  const handleMouseMove = (e) => {
    const { left, top, height, width } =
      e.target.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y })
  }

  return (
    <div className="bg-[#f7f9fb] min-h-screen" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-[#434655] mb-8 flex-wrap">
          <a href="/" className="hover:text-[#004ac6]">Home</a>
          <MdChevronRight className="text-base" />
          <a href="/showroom" className="hover:text-[#004ac6]">Showroom</a>
          <MdChevronRight className="text-base" />
          <span className="text-[#191c1e] font-semibold">{product.name}</span>
        </nav>

        {/* Main product section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20">
          {/* Left — Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[600px] pb-1 md:pb-0">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 overflow-hidden bg-slate-100 transition-colors
                      ${selectedImage === img ? 'border-[#004ac6]' : 'border-[#e0e3e5] hover:border-[#004ac6]/60'}`}
                  >
                    <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 bg-[#eceef0] rounded-3xl  flex items-center justify-center p-8">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt={product.name}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setzoom(true)}
                  onMouseLeave={() => setzoom(false)}
                  className="w-full h-auto max-h-[520px] object-contain transition-transform cursor-pointer"
                />
                

            {zoom && (
                  <div
                    className="absolute left-full ml-10 w-full h-full border rounded-lg shadow-xl bg-white z-50 hidden lg:block"
                    style={{
                      backgroundImage: `url(${selectedImage})`,
                      backgroundPosition: `${position.x}% ${position.y}%`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "300%"
                    }}
                  />
                )}
              </div>
                
              
            </div>
          </div>

          {/* Right — Details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div>
              
              <div className="flex items-start justify-between gap-3">
                
                <div>
                  
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#9d4300]">
                    {product.company}
                  </span>
                  <h1 className="text-4xl font-extrabold tracking-tight text-[#191c1e] mt-1">
                    {product.name}
                  </h1>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  
                  <button
                    onClick={() => toggleCompare(product)}
                    title={isComparing ? 'Remove from compare' : 'Add to compare'}
                    className={`w-11 h-11 rounded-full border shadow-sm flex items-center justify-center transition hover:scale-110 ${isComparing
                      ? 'bg-[#004ac6] border-[#004ac6] text-white'
                      : 'bg-white border-[#e0e3e5] text-[#434655]'
                      }`}
                  >
                    <MdCompareArrows className="text-xl" />
                  </button>
                  <button
                    onClick={handleWishlist}
                    className="w-11 h-11 rounded-full bg-white border border-[#e0e3e5] shadow-sm flex items-center justify-center transition hover:scale-110"
                  >
                    {isWishlisted ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-[#434655] text-lg" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <div onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })} className="flex cursor-pointer items-center gap-1 bg-[#e6e8ea] px-3 py-1 rounded-full">
                  <div className="flex gap-0.5">{stars}</div>
                  <span className="font-bold text-sm ml-1">{ratingValue.toFixed(1)}</span>
                </div>
                <span className="text-[#434655] text-sm">
                  ({product.reviews ?? 0} reviews)
                </span>
              </div>

              <h2 className="text-4xl font-extrabold text-[#004ac6] mt-4">
                ₹{product.price} L
              </h2>

              <div className="flex gap-2 mt-4 flex-wrap">
                {product.fuel && (
                  <span className="bg-[#eceef0] text-[#434655] px-3 py-1 rounded-full text-sm font-medium">
                    {product.fuel}
                  </span>
                )}
                {product.use_case && (
                  <span className="bg-[#eceef0] text-[#434655] px-3 py-1 rounded-full text-sm font-medium">
                    {product.use_case}
                  </span>
                )}
                {product.cc > 0 && (
                  <span className="bg-[#eceef0] text-[#434655] px-3 py-1 rounded-full text-sm font-medium">
                    {product.cc}cc
                  </span>
                )}
              </div>

              {/* {product.description && (
                <p className="text-[#434655] text-base leading-relaxed mt-4">
                  {product.description}
                </p>
              )} */}
            </div>

            {/* Sticky action card */}
            <div className="lg:sticky lg:top-24 bg-white p-6 rounded-3xl shadow-lg border border-[#e0e3e5] flex flex-col gap-4">
              {qty === 0 ? (
                <button
                  onClick={() => addToCart(product)}
                  className="h-14 bg-[#004ac6] text-white rounded-xl font-bold hover:bg-[#2563eb] transition flex items-center justify-center gap-2"
                >
                  <FaShoppingBag />
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center justify-between p-4 bg-[#eceef0] rounded-2xl">
                  <span className="text-sm text-[#434655] font-medium">Quantity</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[#c3c6d7] hover:bg-[#e6e8ea] hover:text-red-500 font-bold transition"
                    >
                      −
                    </button>
                    <span className="font-bold min-w-[1.5rem] text-center">{qty}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#004ac6] text-white hover:bg-[#2563eb] font-bold transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleBuyNow}
                className="h-14 border-2 border-[#004ac6] text-[#004ac6] rounded-xl font-bold hover:bg-[#004ac6]/5 transition flex items-center justify-center gap-2"
              >
                Buy Now
              </button>
              
            </div>
            
            

            {/* Quick services */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-[#eceef0] rounded-2xl">
                <MdLocalShipping className="text-[#004ac6] text-2xl shrink-0" />
                <div>
                  <p className="text-sm font-bold">Free Delivery</p>
                  <p className="text-xs text-[#434655]">Inside city limits</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#eceef0] rounded-2xl">
                <MdVerifiedUser className="text-[#004ac6] text-2xl shrink-0" />
                <div>
                  <p className="text-sm font-bold">Verified Listing</p>
                  <p className="text-xs text-[#434655]">Inspected by MotoShop</p>
                </div>
              </div>
              

            </div>
                          
          </div>
        </section>

        {/* Highlights */}
        {highlights.length > 0 && (
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-[#191c1e] mb-8">Vehicle Highlights</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="bg-[#eceef0] p-6 rounded-3xl border border-[#e0e3e5] hover:border-[#004ac6] transition group"
                >
                  <span className="text-[#004ac6] text-3xl mb-4 inline-block group-hover:scale-110 transition-transform">
                    {h.icon}
                  </span>
                  <p className="text-[#434655] text-sm mb-1">{h.label}</p>
                  <p className="text-xl font-semibold text-[#191c1e]">{h.value}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {(() => {
          const filledSpecs = getSpecFields(product.type).filter(
            (f) => product.specs?.[f.key] !== undefined && product.specs?.[f.key] !== null && product.specs?.[f.key] !== ""
          )
          if (filledSpecs.length === 0) return null
          return (
            <section className="mb-20">
              <h2 className="text-3xl font-bold text-[#191c1e] mb-8">Detailed Specifications</h2>
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 bg-[#eceef0] rounded-3xl border border-[#e0e3e5] p-6 sm:p-8">
                {filledSpecs.map((f) => (
                  <div key={f.key} className="flex items-center justify-between border-b border-[#e0e3e5] pb-3">
                    <span className="text-[#434655] text-sm">{f.label}</span>
                    <span className="font-semibold text-[#191c1e]">
                      {product.specs[f.key]}{f.unit ? ` ${f.unit}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )
        })()}
        {/* Description */}
        {product.description && (
          <section className="mb-20 max-w-3xl">
            <h2 className="text-3xl font-bold text-[#191c1e] mb-6">About this vehicle</h2>
            <p className="text-lg text-[#434655] leading-relaxed">{product.description}</p>
          </section>
        )}
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <SimilarProducts products={similarProducts} />
        <ReviewSection productId={id} />
      </div>
    </div>
  )
}

export default ProductDetails
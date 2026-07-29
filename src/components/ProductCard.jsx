import { useCart } from "../context/CartContext"
import { useWishlist } from "../context/WishlistContext"
import { useCompare } from "../context/CompareContext"
import { useNavigate } from "react-router-dom"
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { MdCompareArrows } from "react-icons/md";

const badgeStyle = {
  new: "bg-emerald-500 text-white",
  hot: "bg-red-500 text-white",
  sale: "bg-blue-600 text-white",
}

export default function ProductCard({ product }) {
  const { addToCart, cart, removeFromCart } = useCart()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const { isInCompare, toggleCompare } = useCompare()
  const isWishlisted = wishlistIds.has(product.id)
  const isComparing = isInCompare(product.id)

  const cartItem = cart.find((item) => item.id === product.id)
  const qty = cartItem ? cartItem.qty : 0
  const navigate = useNavigate()
  const stars = "★".repeat(Math.round(product.rating)) +
    "☆".repeat(5 - Math.round(product.rating))
  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };
  const handleCompare = (e) => {
    e.stopPropagation();
    toggleCompare(product);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="flex bg-white border border-slate-200 rounded-2xl  hover:shadow-2xl overflow-hidden hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      {/* Image — left */}
      <div className="relative w-48 sm:w-64 lg:w-72 shrink-0 bg-linear-to-br from-slate-50 to-white ">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover p-5 group-hover:scale-105 transition-all duration-500"
        />
        {product.badge && (
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md ${badgeStyle[product.badge]}`}>
            {product.badge}
          </span>
        )}
      </div>

      {/* Content — right */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] text-blue-600 uppercase tracking-widest font-semibold">
              {product.use_case || product.company}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCompare}
                title={isComparing ? "Remove from compare" : "Add to compare"}
                className={`w-8 h-8 rounded-full border flex items-center justify-center hover:scale-110 transition cursor-pointer ${
                  isComparing ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-400"
                }`}
              >
                <MdCompareArrows className="text-sm" />
              </button>
              <button
                onClick={handleWishlist}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:scale-110 transition cursor-pointer"
              >
                {isWishlisted ? (
                  <FaHeart className="text-red-500 text-sm" />
                ) : (
                  <FaRegHeart className="text-slate-400 text-sm" />
                )}
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-1 mb-1.5 leading-snug">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-blue-500 text-xs">{stars}</span>
            <span className="text-[11px] text-slate-400">
              ({product.reviews.toLocaleString()})
            </span>
          </div>

          {/* real spec highlights — engine/fuel and vehicle type */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1.5">
              <span className="text-blue-500">{product.fuel === "Electric" ? "⚡" : "⛽"}</span>
              {product.fuel === "Electric" ? "Electric" : `${product.cc}cc · ${product.fuel}`}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-blue-500">🏍</span>
              {product.type === 2 ? "Two-wheeler" : "Four-wheeler"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Price</p>
            <span className="text-blue-600 font-bold text-base">₹{product.price}L</span>
          </div>
          {qty === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product) }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
            >
              + Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }}
                className="w-7 h-7 rounded-md bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-700 font-bold text-sm flex items-center justify-center transition cursor-pointer"
              >
                −
              </button>
              <span className="text-sm font-bold text-slate-900 min-w-4 text-center">
                {qty}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                className="w-7 h-7 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center transition cursor-pointer"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
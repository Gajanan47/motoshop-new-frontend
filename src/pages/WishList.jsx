import { useNavigate } from "react-router-dom"
import { useWishlist } from "../context/WishlistContext"
import ProductCard from "../components/ProductCard"

export default function WishList() {
  const { wishlistProducts, loading } = useWishlist()
  const navigate = useNavigate()

  if (loading) {
    return <p className="text-center mt-10 text-slate-400">Loading your wishlist...</p>
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Wishlist</h1>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg mb-4">Your wishlist is empty.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-md transition cursor-pointer"
          >
            Browse products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
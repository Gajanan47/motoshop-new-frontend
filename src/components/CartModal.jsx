import { useCart } from "../context/CartContext"
import {useNavigate} from 'react-router-dom'
export default function CartModal() {
  const {
    cart, removeFromCart, cartTotal,
    isCartOpen, setIsCartOpen,
  } = useCart()
  const navigate = useNavigate();
  if (!isCartOpen) return null

  const gst = cartTotal * 0.18

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex sm:items-center  justify-center "
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md sm:max-h-[90vh] max-h-[85vh] flex flex-col animate-slide-up sm:animate-fade-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between sm:px-6 px-4 py-4 border-b border-slate-100 shrink">
          <h2 className="text-lg font-semibold text-slate-900">Your cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >✕</button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-5xl mb-3">🛒</div>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add some vehicles to get started</p>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="space-y-1 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
                    
                    {/* Icon */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-orange-50 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0">
                      {item.type === 2 ? "🏍" : "🚗"}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{item.company} · Qty {item.qty}</p>
                    </div>

                    {/* Price */}
                    <span className="text-orange-500 font-semibold text-sm shrink-0">
                      ₹{(item.price * item.qty).toFixed(2)}L
                    </span>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition cursor-pointer text-base shrink-0"
                    >🗑</button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-700 font-medium">₹{cartTotal.toFixed(2)}L</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>GST (18%)</span>
                  <span className="text-slate-700 font-medium">₹{gst.toFixed(2)}L</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Delivery</span>
                  <span className="text-green-500 font-medium">Free</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-1 flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-orange-500 text-lg">₹{(cartTotal + gst).toFixed(2)}L</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="flex gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 shrink-0 pb-6 sm:pb-4">
            <button
              onClick={() => setIsCartOpen(false)}
              className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 text-sm font-medium transition cursor-pointer"
            >
              Keep shopping
            </button>
            <button
              onClick={() => { setIsCartOpen(false)
                 navigate('/checkout') }}
              className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-orange-200"
            >
              Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
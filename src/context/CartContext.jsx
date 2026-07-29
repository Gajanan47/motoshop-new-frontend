import { useContext, useState, createContext } from 'react'

const CartContext = createContext();

export function CartProvider({ children }) {   

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
  setCart((prev) => {
    return prev
      .map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item
      )
      .filter((item) => item.qty > 0)  // remove completely if qty reaches 0
  })
}

  const clearCart = () => {
    setCart([])
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      isCartOpen, setIsCartOpen,
      isPaymentOpen, setIsPaymentOpen,
      isFeedbackOpen, setIsFeedbackOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}  
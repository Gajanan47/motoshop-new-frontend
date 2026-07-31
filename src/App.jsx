import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { CartProvider } from "./context/CartContext"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MyOrders from "./pages/MyOrders"
import Profile from "./pages/Profile"
import LoginSecurity from "./pages/LoginSecurity"
import CartModal from "./components/CartModal"
import ProductDetails from "./pages/ProductDetails"
import WishList from "./pages/WishList"
import Addresses from "./pages/Addresses"
import ReAuth from "./pages/ReAuth"
import ProtectedRoute from "./pages/ProtectedRoute"
import Checkout from "./pages/Checkout"
import AdminDashboard from "./pages/AdminDashboard"
import AdminLogin from "./pages/AdminLogin"
import OrderDetails from "./pages/OrderDetails"
import AdminProtectedRoute from "./pages/AdminProtectedRoute"
import Compare from "./pages/Compare"
import Navbar from "./components/Navbar"

import { WishlistProvider } from "./context/WishlistContext"
import { CompareProvider } from "./context/CompareContext"
import CompareTray from "./components/CompareTray"


function AppContent() {
  const location = useLocation()

  const isLoginPage = location.pathname === '/login'
  const isRegisterPage = location.pathname === '/register'
  const isAdminLoginPage = location.pathname === '/admin/login'
  const isAdminPage = location.pathname === '/admin'

  const showChatBot = !isLoginPage && !isRegisterPage && !isAdminLoginPage && !isAdminPage

  return (
    <>
      <Routes>
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
        <Route path="/my-orders" element={<ProtectedRoute><Navbar /><MyOrders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>} />
        <Route path="/account/addresses" element={<><Navbar /><Addresses /></>} />
        <Route path="/account/reauth" element={<ReAuth />} />
        <Route path="/account/login-security" element={<><Navbar /><LoginSecurity /></>} /> 
        <Route path="/" element={<><Navbar /><Home /></>} />
         <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/products/:id" element={<><Navbar /><ProductDetails /></>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Navbar /><WishList /></ProtectedRoute>} />
        <Route path="/compare" element={<><Navbar /><Compare /></>} />
        <Route path="/admin/orders/:id" element={<AdminProtectedRoute><OrderDetails /></AdminProtectedRoute>} /> 
      </Routes>

      {/* {showChatBot && <ChatBot />} */}
      <CompareTray/>
      <CartModal/>
      
     
    </>
  )
}

function App() {
  return (
    <WishlistProvider>
      <CompareProvider>
        <CartProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </CompareProvider>
    </WishlistProvider>
  )
}

export default App
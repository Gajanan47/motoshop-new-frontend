import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  generateProductDescription
} from "../api/products"
import { fetchOrders, updateOrderStatus } from "../api/orders"
import NotificationBell from "../components/NotificationBell"

const emptyForm = {
  name: "", company: "", type: 2, cc: 0,
  fuel: "Petrol", use_case: "Commuter",
  price: "", rating: 0, reviews: 0, badge: "",
  description: "",
  images: [""]
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const adminEmail = localStorage.getItem("adminEmail")
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [popupOpen, setPopupOpen] = useState(false)
  const [tab, setTab] = useState("overview")  // "overview" | "products" | "orders"
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFiles, setImageFiles] = useState([])
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [generateError, setGenerateError] = useState("")

  async function handleGenerateDescription() {
    if (!form.name || !form.company) {
      setGenerateError("Enter at least the name and company first")
      return
    }
    setGenerateError("")
    setGeneratingDescription(true)
    try {
      const res = await generateProductDescription({
        name: form.name,
        company: form.company,
        type: form.type,
        cc: form.cc,
        fuel: form.fuel,
        use_case: form.use_case,
        price: form.price,
      })
      setForm((prev) => ({ ...prev, description: res.data.description }))
    } catch (err) {
      setGenerateError(err.response?.data?.message || "Failed to generate description")
    } finally {
      setGeneratingDescription(false)
    }
  }
  const [formLoading, setFormLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [popupMsg, setPopupMsg] = useState("")
  // product table search/filter
  const [productSearch, setProductSearch] = useState("")
  const [productTypeFilter, setProductTypeFilter] = useState("all")
  // refresh 
  const [loading, setLoading] = useState(false)
  // order filter
  const [orderDateFilter, setOrderDateFilter] = useState("all") // "all" | "today"
  const [orderStatusFilter, setOrderStatusFilter] = useState("all")
  const [statusloading, setStatusLoading] = useState(false)
  useEffect(() => {
    loadProducts()
    loadOrders()
  }, [])

  // ── Independent loaders ──
  // Each tab loads on its own. If orders fails, products still show, and vice versa.
  async function loadProducts() {
    setLoadingProducts(true)
    try {
      const res = await fetchProducts()
      setProducts(res.data.data || [])
    } catch (err) {
      console.log("Product load error:", err.message)
      setLoadError(prev => prev || "Failed to load products: " + err.message)
    } finally {
      setLoadingProducts(false)
    }
  }


  async function loadOrders() {
    console.log("loaders activated")
    setLoadingOrders(true)
    try {
      const res = await fetchOrders()
      console.log("Orders API Response:", res.data)
      console.log(res.data.data)
      setOrders(res.data.data || [])
    } catch (err) {
      console.log("Order load error:", err.message)
      setLoadError(prev => prev || "Failed to load orders: " + err.message)
    } finally {
      setLoadingOrders(false)
    }
  }

  function refreshAll() {
    loadProducts()
    loadOrders()
    setLoading(true);
    setTimeout(() => {
      setLoading(false)
    }, 200);
  }

  function handleLogout() {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminEmail")
    navigate("/admin/login")
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }
  function handleRatingChange(e) {
    const val = e.target.value
    if (val === "" || (Number(val) >= 0 && Number(val) <= 5)) {
      setForm((prev) => ({ ...prev, rating: val }));
    }
  }
  function handleCcChange(e) {
    const val = e.target.value
    if (val === "" || (Number(val) >= 0 && Number(val) <= 10000)) {
      setForm((prev) => ({ ...prev, cc: val }))
    }
  }

  function openAddForm() {
    setForm(emptyForm)
    setImageFiles([])
    setEditingProduct(null)
    setShowForm(true)
  }

  function openEditForm(product) {
    setForm({
      name: product.name,
      company: product.company,
      type: product.type,
      cc: product.cc,
      fuel: product.fuel,
      use_case: product.use_case,
      price: product.price,
      rating: product.rating,
      reviews: product.reviews,
      badge: product.badge,
      description: product.description || "",
      images: product.images?.length
        ? product.images.filter(Boolean)
        : [""]
    })
    setImageFiles([])
    setEditingProduct(product)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    try {
      const data = new FormData()
      Object.entries({
        name: form.name,
        company: form.company,
        type: form.type,
        cc: form.cc,
        fuel: form.fuel,
        use_case: form.use_case,
        price: form.price,
        rating: form.rating,
        reviews: form.reviews,
        badge: form.badge,
        description: form.description,
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value)
        }
      })

      form.images.filter(Boolean).forEach((url) => data.append("images", url))
      imageFiles.forEach((file) => data.append("images", file))

      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
        setMessage("Product updated successfully!")
      } else {
        await addProduct(data)
        setMessage("Product added successfully!")
      }
      setShowForm(false)
      setForm(emptyForm)
      setImageFiles([])
      setEditingProduct(null)
      loadProducts()
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong")
    } finally {
      setFormLoading(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(id)
      setMessage("Product deleted!")
      loadProducts()
    } catch (err) {
      setMessage("Delete failed")
    } finally {
      setTimeout(() => setMessage(""), 3000)
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      setStatusLoading(true)
      await updateOrderStatus(orderId, status)
      setPopupOpen(true);
      setPopupMsg(`Order status changed to "${status}" successfully`)
      loadOrders()
    } catch (err) {
      setMessage("Status update failed")
    } finally {
      setStatusLoading(false)
      setTimeout(() => setPopupOpen(false), 2000)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const statusColors = {
    Confirmed: "bg-blue-100 text-blue-600",
    Processing: "bg-yellow-100 text-yellow-600",
    Shipped: "bg-purple-100 text-purple-600",
    Delivered: "bg-green-100 text-green-600",
    Cancelled: "bg-red-100 text-red-600",
  }

  // ── Derived stats for Overview tab ──
  function isToday(dateStr) {
    const d = new Date(dateStr)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  }

  const stats = useMemo(() => {
    const ordersToday = orders.filter(o => isToday(o.created_at))
    const revenueToday = ordersToday.reduce(
      (sum, o) => sum + parseFloat(o.total || 0) + parseFloat(o.gst || 0), 0
    )
    const totalRevenue = orders.reduce(
      (sum, o) => sum + parseFloat(o.total || 0) + parseFloat(o.gst || 0), 0
    )

    // orders by brand — look inside each order's items array
    const brandCounts = {}
    orders.forEach(o => {
      ; (o.items || []).forEach(item => {
        const brand = item.company || "Unknown"
        brandCounts[brand] = (brandCounts[brand] || 0) + (item.qty || 1)
      })
    })
    const brandRanking = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])

    // orders by brand TODAY
    const brandCountsToday = {}
    ordersToday.forEach(o => {
      ; (o.items || []).forEach(item => {
        const brand = item.company || "Unknown"
        brandCountsToday[brand] = (brandCountsToday[brand] || 0) + (item.qty || 1)
      })
    })

    const statusCounts = {}
    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
    })

    const productsNoImage = products.filter(p => !p.images || p.images.filter(Boolean).length === 0)
    const inventoryValue = products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0)

    return {
      ordersTodayCount: ordersToday.length,
      revenueToday,
      totalRevenue,
      totalOrders: orders.length,
      brandRanking,
      brandCountsToday,
      statusCounts,
      productsNoImage,
      inventoryValue,
      totalProducts: products.length,
    }
  }, [orders, products])

  // ── Filtered products for table ──
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (productTypeFilter !== "all" && String(p.type) !== productTypeFilter) return false
      if (productSearch.trim()) {
        const q = productSearch.trim().toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.company.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [products, productSearch, productTypeFilter])
  const itemsPerPage = 10;
  const indexOfLastItem = currentProductsPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const displayedProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  // ── Filtered orders ──
  const filteredOrders = useMemo(() => {
    let result = orders
    if (orderDateFilter === "today") {
      result = result.filter(o => isToday(o.created_at))
    }
    if (orderStatusFilter !== "all") {
      result = result.filter(o => o.status === orderStatusFilter)
    }
    return result
  }, [orders, orderDateFilter, orderStatusFilter])
  const indexOfLastOrderItem = currentOrdersPage * itemsPerPage
  const indexOfFirstOrderItem = indexOfLastOrderItem - itemsPerPage

  const displayedOrders = filteredOrders.slice(indexOfFirstOrderItem, indexOfLastOrderItem);
  useEffect(() => {
    setCurrentOrdersPage(1);
  }, [orderStatusFilter, orderDateFilter])

  useEffect(() => {
    setCurrentProductsPage(1);

  }, [productSearch, productTypeFilter])



  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 sm:h-14 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-10 gap-3">
        <h1 className="text-base sm:text-lg font-bold flex items-center justify-between w-full sm:w-auto">
          <span>MOTO<span className="text-orange-500">SHOP</span><span className="text-slate-400 text-xs font-normal ml-1">Admin</span></span>
          <span className="text-xs font-normal text-slate-400 sm:hidden block truncate max-w-37.5">{adminEmail}</span>
        </h1>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
          <div className="flex gap-2">
            {localStorage.getItem("adminToken") && (
              <NotificationBell role="admin" />
            )}
            <button
              onClick={refreshAll}
              className="text-xs sm:text-sm px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:border-orange-400 hover:text-orange-500 transition cursor-pointer"
            >
              ⟳ Refresh
            </button>

            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:border-red-400 hover:text-red-500 transition cursor-pointer"
            >
              Logout
            </button>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">{adminEmail}</span>
        </div>
      </nav>

      {loading && (
        <div>
          <p className="p-2 bg-orange-500 text-white text-center text-xs font-medium animate-pulse">Loading...</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Success/error message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-xs sm:text-sm rounded-xl px-4 py-3 mb-4">
            {message}
          </div>
        )}
        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
            <span>{loadError}</span>
            <button onClick={() => setLoadError("")} className="text-red-400 hover:text-red-600 cursor-pointer">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 no-scroller shrink-0">
          <button
            onClick={() => setTab("overview")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${tab === "overview" ? "bg-orange-500 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${tab === "products" ? "bg-orange-500 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
          >
            🏍 Products ({products.length})
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${tab === "orders" ? "bg-orange-500 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
          >
            📦 Orders ({orders.length})
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-6">

            {/* Top stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Orders Today" value={stats.ordersTodayCount} onClick={() => {
                setOrderDateFilter("today")
                setTab("orders")
              }} icon="🛒" />
              <StatCard label="Revenue Today" value={`₹${stats.revenueToday.toFixed(2)}L`} icon="💰" />
              <StatCard label="Total Orders" value={stats.totalOrders} onClick={() => setTab("orders")} icon="📦" />
              <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}L`} icon="📈" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Total Products"
                value={stats.totalProducts}
                onClick={() => setTab("products")} icon="🏍" />
              <StatCard label="Inventory Value"
                value={`₹${stats.inventoryValue.toFixed(2)}L`}
                icon="🏷️" />
              <StatCard label="Products Missing Images"
                value={stats.productsNoImage.length}
                icon="🖼️"
                warn={stats.productsNoImage.length > 0} />
              <StatCard label="Pending Orders"
                value={stats.statusCounts["Confirmed"] || 0}
                onClick={() => {
                  setOrderStatusFilter("Confirmed")
                  setTab("orders")
                }} icon="⏳" />
            </div>

            {/* Orders by brand */}
            <div className="bg-white rounded-2xl shadow-sm sm:p-5 p-4">
              <h2 className="font-semibold sm:text-base text-sm text-slate-900 mb-4">Orders by Brand (All Time)</h2>
              {stats.brandRanking.length === 0 ? (
                <p className="text-slate-400 text-sm">No order data yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.brandRanking.map(([brand, count]) => {
                    const maxCount = stats.brandRanking[0][1]
                    const pct = (count / maxCount) * 100
                    return (
                      <div key={brand} className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-slate-600 w-20 sm:w-28 truncate">{brand}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 w-8 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Today's brand breakdown + order status breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
                <h2 className="font-semibold text-xs sm:text-sm text-slate-900 mb-3">Today's Orders by Brand</h2>
                {Object.keys(stats.brandCountsToday).length === 0 ? (
                  <p className="text-slate-400 text-sm">No orders placed today yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(stats.brandCountsToday).map(([brand, count]) => (
                      <span key={brand} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {brand}  ({count})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
                <h2 className="font-semibold sm:text-base text-sm text-slate-900 mb-4">Orders by Status</h2>
                {Object.keys(stats.statusCounts).length === 0 ? (
                  <p className="text-slate-400 text-sm">No orders yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.statusCounts).map(([status, count]) => (
                      <span key={status} className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusColors[status] || "bg-slate-100 text-slate-600"}`}>
                        {status}  {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Products missing images warning list */}
            {stats.productsNoImage.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
                <h2 className="font-semibold sm:text-base text-sm text-slate-900 mb-2">⚠️ Products Missing Images</h2>
                <div className="flex flex-wrap gap-2">
                  {stats.productsNoImage.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setTab("products"); openEditForm(p) }}
                      className="text-xs px-2.5 py-1.5 rounded-md bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 ">
              <h2 className="font-bold text-sm sm:text-base text-slate-900">All Products</h2>
              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search name or brand..."
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-400 w-full sm:w-40"
                />
                <select
                  value={productTypeFilter}
                  onChange={(e) => setProductTypeFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-400 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">All Types</option>
                  <option value="2">Two-wheeler</option>
                  <option value="4">Four-wheeler</option>
                </select>
                <button
                  onClick={openAddForm}
                  className="col-span-2 sm:col-span-1 bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-lg font-semibold shadow-xs cursor-pointer text-center"
                >
                  + Add Product
                </button>
              </div>
            </div>

            {loadingProducts ? (
              <p className="text-slate-400 text-sm">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center text-slate-400">
                <div className="text-4xl mb-2">🔍</div>
                <p>No products match</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs min-w-150">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium text-left">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Fuel</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Badge</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {displayedProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.company}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{p.type === 2 ? "🏍 2W" : "🚗 4W"}</td>
                          <td className="px-4 py-3 text-slate-500">{p.fuel}</td>
                          <td className="px-4 py-3 font-bold text-orange-500">₹{p.price}L</td>
                          <td className="px-4 py-3">
                            {p.badge ? <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">{p.badge}</span> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-1.5 justify-end">
                              <button onClick={() => openEditForm(p)} className="px-2 py-1 border border-slate-200 rounded text-slate-600 hover:border-orange-400 hover:text-orange-500">Edit</button>
                              <button onClick={() => handleDelete(p.id, p.name)} className="px-2 py-1 border border-slate-200 rounded text-slate-600 hover:border-red-400 hover:text-red-500">Drop</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-200 text-xs">

              {/* Left Column: Context Tracker (Centered on mobile, left-aligned on PC) */}
              <div className="text-slate-500 font-medium text-center sm:text-left order-2 sm:order-1">
                Page <span className="font-bold text-slate-900">{currentProductsPage}</span> of {Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))}
              </div>

              {/* Right Column: Button Group (Stays together as a single block) */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end order-1 sm:order-2">
                <button
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-600 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 font-medium transition cursor-pointer"
                  onClick={() => setCurrentProductsPage(prev => Math.max(prev - 1, 1))} disabled={currentProductsPage === 1}
                >
                  ← Prev
                </button>
                {/* ✅ FIXED VERSION: */}
                <button
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-600 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 font-medium transition cursor-pointer"
                  onClick={() => setCurrentProductsPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / itemsPerPage)))}
                  disabled={currentProductsPage >= Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
        {popupOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-sm w-full text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-slate-900 font-medium text-sm">{popupMsg}</p>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 ">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">All Orders</h2>
              <div className="grid grid-cols-2 w-full items-center sm:w-auto">
                <select
                  value={orderDateFilter}
                  onChange={(e) => setOrderDateFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 cursor-pointer transition hover:border-slate-300"
                >
                  <option value="all">All Orders</option>
                  <option value="today">Today Only</option>
                </select>
                <select value={orderStatusFilter}

                  onChange={(e) =>
                    setOrderStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 cursor-pointer hover:border-slate-300 transition"
                >
                  <option value="all" > All </option>
                  <option value="Confirmed" > Confirmed </option>
                  <option value="Processing" > Processing </option>
                  <option value="Shipped" > Shipped </option>
                  <option value="Delivered" > Delivered </option>
                  <option value="Cancelled" > Cancelled </option>
                </select>
              </div>
            </div>

            {loadingOrders ? (
              <p className="text-slate-400 text-xs">Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-xs text-center text-slate-400">
                <div className="text-4xl mb-2">📦</div>
                <p>No orders {orderDateFilter === "today" ? "today" : "yet"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedOrders.map((order) => (
                  <div key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)} className="bg-white shadow-xs rounded-xl  p-4 border border-slate-100 hover:border-orange-300 transition cursor-pointer">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2">

                      {/* Order info */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900">{order.order_id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{order.customer_name} · {order.customer_email}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{order.customer_phone}</p>
                        <p className="text-[11px] text-slate-400 max-w-xs md:max-w-md mt-1">{order.delivery_address}</p>
                      </div>

                      {/* Price + status update */}
                      <div className="text-right">
                        <p className="font-bold text-orange-500 text-lg">
                          ₹{(parseFloat(order.total) + parseFloat(order.gst)).toFixed(2)}L
                        </p>
                        <p className="text-xs text-slate-400 mb-2">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 cursor-pointer focus:outline-none focus:border-orange-400"
                        >
                          <option>Confirmed</option>
                          <option>Processing</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                        {statusloading && (
                          <p className="text-xs text-orange-500 mt-2">Changing status...</p>
                        )}
                      </div>
                    </div>


                    {/* Order items */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">

                      {(order.items || []).map((item, i) => (
                        <span key={i} className="text-black bg-slate-50 border border-slate-100 font-bold text-xs px-3 py-1 rounded-full">
                          {item.name} × {item.qty}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <button
                className="text-sm px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition"
                onClick={() => setCurrentOrdersPage(prev => Math.max(prev - 1, 1))}
                disabled={currentOrdersPage === 1}
              >
                ← Previous
              </button>

              <span className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-900">{currentOrdersPage}</span> of {Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage))}
              </span><span className="font-medium text-slate-">Total orders {filteredOrders.length}</span>

              <button
                className="text-sm px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition"
                onClick={() => setCurrentOrdersPage(prev =>
                  Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage))
                )}
                disabled={indexOfLastOrderItem >= filteredOrders.length}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Duke 390" required />
                <Field label="Company" name="company" value={form.company} onChange={handleChange} placeholder="e.g. KTM" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Type</label>
                  <select name="type" value={form.type} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-400">
                    <option value={2}>Two-wheeler</option>
                    <option value={4}>Four-wheeler</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Fuel</label>
                  <select name="fuel" value={form.fuel} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-400">
                    <option>Petrol</option>
                    <option>Electric</option>
                    <option>Diesel</option>
                    <option>CNG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Engine CC" name="cc" min="0" max="10000" value={form.cc} onChange={handleCcChange} placeholder="e.g. 373" type="number" />
                <Field label="Price (₹L)" name="price" value={form.price} min="0.1" max="100" onChange={handleChange} placeholder="e.g. 3.15" type="number" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Use case</label>
                  <select name="use_case" value={form.use_case} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-400">
                    <option>Commuter</option>
                    <option>Sport</option>
                    <option>Adventure</option>
                    <option>Family</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Badge</label>
                  <select name="badge" value={form.badge} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-400">
                    <option value="">None</option>
                    <option value="new">New</option>
                    <option value="hot">Hot</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Rating (0-5)" name="rating" min="0" max="5" step="0.1" value={form.rating} onChange={handleRatingChange} placeholder="e.g. 4.5" type="number" />
                <Field label="Reviews" name="reviews" value={form.reviews} onChange={handleChange} placeholder="e.g. 650" type="number" />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-500 font-medium block">Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={generatingDescription}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700 disabled:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    {generatingDescription ? "Generating..." : "✨ Generate with AI"}
                  </button>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write product description, or fill the fields above and click Generate with AI..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 transition resize-none"
                />
                {generateError && (
                  <p className="text-xs text-red-500 mt-1">{generateError}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  AI-generated text is a starting point — review and edit before saving.
                </p>
              </div>

              {/* Images */}
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Upload Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles((prev) => [...prev, ...Array.from(e.target.files)])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-400 transition"
                />
                {imageFiles.length > 0 && (
                  <div className="mt-3 space-y-2 text-slate-600 text-sm">
                    <div className="font-medium text-slate-900">Selected files</div>
                    {imageFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-3 py-2 text-slate-700">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >Remove</button>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.filter(Boolean).length > 0 && (
                  <div className="mt-3">
                    <div className="font-medium text-slate-900 text-sm mb-2">Existing images</div>
                    <div className="grid grid-cols-3 gap-2">
                      {form.images.filter(Boolean).map((url, index) => (
                        <div key={url} className="relative group">
                          <img
                            src={url}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                images: prev.images.filter((u) => u !== url)
                              }))
                            }
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none cursor-pointer"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm hover:border-orange-400 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white font-semibold rounded-xl text-sm transition cursor-pointer">
                  {formLoading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder, type = "text", required }) {
  return (
    <div>
      <label className="text-xs text-slate-500 font-medium block mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 transition"
      />
    </div>
  )
}

function StatCard({ label, value, icon, warn, onClick }) {
  return (

    <div onClick={onClick} className={`bg-white rounded-2xl shadow-sm p-4 border hover:border-orange-400 hover:-translate-y-0.5 ${warn ? "border-red-200" : "border-transparent"}  ${onClick ? "cursor-pointer " : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${warn ? "text-red-500" : "text-slate-900"}`}>{value}</p>
    </div>
  )
}
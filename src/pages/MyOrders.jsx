import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchMyOrders, cancelOrder } from "../api/orders"

const filters = [
  { label: "All", value: "all" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" }
]
const CANCELLABLE_STATUS = ["Confirmed", "Pending", "Processing"]

export default function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelingId, setCancelingId] = useState(null)

  useEffect(() => {
    

    loadOrders()
  }, [])
  async function loadOrders() {
      try {
        const res = await fetchMyOrders()
        setOrders(res.data.data || [])
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your orders")
      } finally {
        setLoading(false)
      }
    }

    async function handleCancel(orderId){
      if(!window.confirm("Cancel this order? This cannot be undone."))return
      setCancelingId(orderId) 
      try{
        await cancelOrder(orderId)
        setOrders(prev => 
          prev.map(o=> o.id === orderId ? {...o, status: "Cancelled"}: o)
        )
      }catch (err){
        alert(err.response?.data?.message || "Could not cancel this order")
      }
      finally{
        setCancelingId(null)
      }
    }

  // function cancelOrder() {

  // } 

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders
    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Your Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Track your MotoShop purchases and delivery status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5">
          <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 h-fit">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Filters</h2>
            <div className="space-y-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                    statusFilter === filter.value
                      ? "bg-orange-500 text-white"
                      : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </aside>

          <section>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3 mb-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm text-slate-500">Showing</p>
                  <p className="font-semibold text-slate-900">
                    {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                Loading your orders...
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-600 text-sm">
                {error}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <p className="text-lg font-semibold text-slate-900">No orders found</p>
                <p className="text-sm text-slate-500 mt-1">Your matching orders will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order}
                   onCancel={handleCancel}
                   canceling = {cancelingId === order.id}
                   />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function OrderCard({ order, onCancel, canceling }) {
  const items = Array.isArray(order.items) ? order.items : []
  const firstItem = items[0] || {}
  const total = Number(order.total || 0) + Number(order.gst || 0)
  const canCancel = CANCELLABLE_STATUS.includes(order.status)

  return (
    <article className="bg-white border border-slate-200 hover:border-orange-400 rounded-2xl shadow-sm p-4 transition">
      <div className="grid grid-cols-[64px_1fr] md:grid-cols-[76px_1fr_140px_160px] gap-4 items-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden">
          {firstItem.image ? (
            <img src={firstItem.image} alt={firstItem.name || "Product"} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-2xl">🏍</span>
          )}
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-1">{order.order_id}</p>
          <h2 className="font-semibold text-slate-900">{firstItem.name || "MotoShop order"}</h2>
          <p className="text-sm text-slate-500">
            {items.length > 1 ? `${items.length} items` : `Qty ${firstItem.qty || 1}`}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Price</p>
          <p className="font-bold text-orange-500">₹{total.toFixed(2)}L</p>
        </div>

        <div className="md:text-left">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusClass(order.status)}`}>
            {order.status}
          </span>
          <p className="text-xs text-slate-500 mt-2">
            Ordered on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
       

      </div>
      {canCancel && (
  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
    <button
      onClick={() => onCancel(order.id)}
      disabled={canceling}
      className="text-xs px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
    >
      {canceling ? "Cancelling..." : "Cancel order"}
    </button>
  </div>
)}
    </article>
  )
}

function statusClass(status) {
  const styles = {
    Confirmed: "bg-blue-100 text-blue-600",
    Processing: "bg-yellow-100 text-yellow-700",
    Shipped: "bg-purple-100 text-purple-600",
    Delivered: "bg-green-100 text-green-600",
    Cancelled: "bg-red-100 text-red-600"
  }

  return styles[status] || "bg-slate-100 text-slate-600"
}

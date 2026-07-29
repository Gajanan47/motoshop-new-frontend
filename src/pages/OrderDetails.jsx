import React, {useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {fetchOrderById, fetchOrderInvoice, emailOrderInvoice, updateOrderStatus } from '../api/orders.js'

const statusColors = {
     Confirmed:  "bg-blue-100 text-blue-600",
  Processing: "bg-yellow-100 text-yellow-600",
  Shipped:    "bg-purple-100 text-purple-600",
  Delivered:  "bg-green-100 text-green-600",
  Cancelled:  "bg-red-100 text-red-600",
}

const OrderDetails = () => {
    const {id} = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [popupOpen, setPopupOpen] = useState(false)
    const [popupMsg, setPopupMsg] = useState("")
    const [invoiceLoading, setInvoiceLoading] = useState(false)
const navigate = useNavigate()
    useEffect(() => {
      loadOrder()
    }, [id])

    async function loadOrder(){
        setLoading(true)
        setError("")
        try{
            const res = await fetchOrderById(id)
            setOrder(res.data.data)
        }catch(err){
            setError(err.response?.data?.message || "failed to load")
        }finally{
            setLoading(false)
        }
    }
    const showPopup = (message) => {
      setPopupMsg(message)
      setPopupOpen(true)
      setTimeout(() => setPopupOpen(false), 3000)
    }
    async function handleInvoiceDownload(){
      setInvoiceLoading(true)
      try {
        const response = await fetchOrderInvoice(id)
        const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }))
        const link = document.createElement("a")
        link.href = url
        link.download = `invoice-${order.order_id.replace("#", "")}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        showPopup(err.response?.data?.message || "Invoice is not available")
      } finally {
        setInvoiceLoading(false)
      }
    }
    async function handleInvoiceEmail(){
      setInvoiceLoading(true)
      try {
        const response = await emailOrderInvoice(id)
        showPopup(response.data.message)
      } catch (err) {
        showPopup(err.response?.data?.message || "Unable to send invoice email")
      } finally {
        setInvoiceLoading(false)
      }
    }
    async function handleStatusChange(newStatus){
        try{
            await updateOrderStatus(id, newStatus)
            setPopupOpen(true)
            setPopupMsg(`Order status changed to "${newStatus}"`)
            loadOrder()
        }
        catch(err){
            setPopupMsg("Status update failed")
            setPopupOpen(true)
        }
        finally{
            setTimeout(() => {
                setPopupOpen(false)
            }, 3000); 
            
        }
       
        
    }
    if(loading){
             return <div className = "min-h-screen bg-slate-100 flex items-center justify-center">
                <p className="text-slate-400 text-sm">
                    Loading Order...
                </p>
            </div>
        }
        if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-slate-600 text-sm mb-4">{error || "Order not found"}</p>
          <button
            onClick={() => navigate("/admin")}
            className="text-sm px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  const items = order.items || []
  const subTotal = parseFloat(order.total || 0)
  const gst = parseFloat(order.gst || 0)
  const grandTotal = subTotal + gst
  return (
    <div className="min-h-screen bg-slate-100">
        <nav className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
            <h1 className="sm:text-lg text-base  font-bold ">MOTO<span className="text-lg font-bold text-orange-500 ">SHOP</span>
            <span className="text-xs font-normal ml-1 text-slate-400">Admin</span></h1>

            <button onClick={()=> navigate("/admin")}
                className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:border-orange-400 hover:text-orange-500 transition cursor-pointer">
                    ← Back To Dashboard
            </button>
        </nav>

         <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">

        {/* Header card — order id, status, date */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-slate-900">{order.order_id}</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] || "bg-slate-100 text-slate-600"}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Placed on {new Date(order.created_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Update Status</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 cursor-pointer focus:outline-none focus:border-orange-400"
              >
                <option>Confirmed</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer + delivery info */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-400">Name</span>
                <p className="text-slate-900 font-medium">{order.customer_name}</p>
              </div>
              <div>
                <span className="text-slate-400">Email</span>
                <p className="text-slate-900">{order.customer_email}</p>
              </div>
              <div>
                <span className="text-slate-400">Phone</span>
                <p className="text-slate-900">{order.customer_phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Delivery Address</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {order.delivery_address || "No address provided"}
            </p>
          </div>
        </div>

        {/* Items table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Items Ordered</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Item</th>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Brand</th>
                <th className="text-right px-6 py-3 text-slate-500 font-medium">Qty</th>
                <th className="text-right px-6 py-3 text-slate-500 font-medium">Price</th>
                <th className="text-right px-6 py-3 text-slate-500 font-medium">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-400">
                    No items found for this order
                  </td>
                </tr>
              ) : (
                items.map((item, i) => {
                  const price = parseFloat(item.price || 0)
                  const qty = item.qty || 1
                  return (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-900">{item.name}</td>
                      <td className="px-6 py-3 text-slate-500">{item.company || "—"}</td>
                      <td className="px-6 py-3 text-right text-slate-700">{qty}</td>
                      <td className="px-6 py-3 text-right text-slate-700">₹{price.toFixed(2)}L</td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">
                        ₹{(price * qty).toFixed(2)}L
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Financial summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{subTotal.toFixed(2)}L</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST</span>
              <span>₹{gst.toFixed(2)}L</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span className="text-orange-500">₹{grandTotal.toFixed(2)}L</span>
            </div>
          </div>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">Invoice</h3>
            <p className="text-sm text-slate-500 mt-1">PDF invoice for {order.order_id}. It is sent automatically with the order confirmation email.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleInvoiceDownload}
              disabled={invoiceLoading}
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg text-slate-700 hover:border-orange-400 hover:text-orange-500 disabled:opacity-50 transition cursor-pointer"
            >
              {invoiceLoading ? "Please wait..." : "Download PDF"}
            </button>
            <button
              onClick={handleInvoiceEmail}
              disabled={invoiceLoading}
              className="text-sm px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 transition cursor-pointer"
            >
              Email Invoice
            </button>
          </div>
        </div>

      </div>

      {/* STATUS CHANGE POPUP */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-sm w-full text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-slate-900 font-medium text-sm">{popupMsg}</p>
          </div>
        </div>
      )}
    </div>
  )
}
    

export default OrderDetails

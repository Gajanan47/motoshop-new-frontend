import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { placeOrder } from "../api/orders"
import { fetchMyAddresses, addAddress } from "../api/addresses"
import {fetchMe} from "../api/users"

export default function Checkout() {
  const { cart, cartTotal, clearCart, removeFromCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const name = localStorage.getItem("userName")
  const [form, setForm] = useState({
    name: name || "", email: "", phone: "",
    addressLine: "", city: "", state: "", pincode: ""
  })
  const [paid, setPaid] = useState(false)
  const location = useLocation()
  const buyNowItem = location.state?.buyNowItem
  const checkoutCart = buyNowItem ? [buyNowItem] : cart
  const checkoutCartTotal = checkoutCart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const gst = checkoutCartTotal * 0.18
  const total = checkoutCartTotal + gst

  useEffect(() => {
    async function loadAccountDetails() {
      try {
        const res = await fetchMe()
        const user = res.data.data
        setForm((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
        }))
      } catch (err) {
        console.log("Could not load account details:", err.message)
      }
    }
    loadAccountDetails()
  }, [])

  // ── Saved addresses ──
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null) // an id, or "new"
  const [saveThisAddress, setSaveThisAddress] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)

  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetchMyAddresses()
        const list = res.data.data || []
        setSavedAddresses(list)
        const def = list.find(a => a.is_default) || list[0]
        if (def) {
          selectSavedAddress(def)
        } else {
          setSelectedAddressId("new")
        }
      } catch (err) {
        console.log("Could not load saved addresses:", err.message)
        setSelectedAddressId("new")
      } finally {
        setLoadingAddresses(false)
      }
    }
    loadAddresses()
  }, [])

  useEffect(() => {
    if (!buyNowItem && cart.length === 0 && step === 0 && !paid) {
      navigate("/")
    }
  }, [buyNowItem, navigate, cart, step, paid])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function selectSavedAddress(addr) {
    setSelectedAddressId(addr.id)
    setForm(prev => ({
      ...prev,
      name: addr.full_name,
      phone: addr.phone,
      addressLine: addr.address_line,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }))
  }

  function useNewAddress() {
    setSelectedAddressId("new")
    setForm(prev => ({ ...prev, addressLine: "", city: "", state: "", pincode: "" }))
  }

  function openRazorpay() {
    setLoading(true)
    const deliveryAddress = `${form.addressLine}, ${form.city}, ${form.state} - ${form.pincode}`

    const options = {
      key: "rzp_test_T0bixIXmrfeVIp",
      amount: Math.round(total * 100),
      currency: "INR",
      name: "MotoShop",
      description: `Order for ${checkoutCart.length} vehicle(s)`,
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: "#f97316" },

      handler: async function (response) {
        try {
          await placeOrder({
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone,
            deliveryAddress,
            items: checkoutCart,
            total: checkoutCartTotal,
            gst: gst,
          })

          // (B) save this as a new address if the user asked us to
          if (selectedAddressId === "new" && saveThisAddress) {
            try {
              await addAddress({
                full_name: form.name,
                phone: form.phone,
                address_line: form.addressLine,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
                is_default: savedAddresses.length === 0,
              })
            } catch (err) {
              console.log("Could not save address:", err.message)
            }
          }
        } catch (err) {
          console.log("Order save failed:", err.message)
        }

        setLoading(false)
        setPaid(true)
        setStep(1)
        clearCart()
      },
      modal: {
        ondismiss: function () {
          setLoading(false)
        },
      },
    }

    try {
      if (!window.Razorpay) {
        alert("Razorpay failed to load. Please disable ad blocker and refresh.")
        setLoading(false)
        return
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Razorpay error:", error)
      setLoading(false)
    }
  }

  const addressComplete = form.addressLine && form.city && form.state && form.pincode
  const canPay = form.name && form.email && form.phone && addressComplete && !loading

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white border-b border-slate-200 px-11 max-w-[1440px] h-20 flex items-center justify-between">
        <span onClick={() => navigate("/")} className="  tracking-tight cursor-pointer shrink-0 font-display text-2xl text-[#005ab4] font-bold">
          MotoShop
        </span>
        <span className="text-sm text-slate-400">Secure Checkout</span>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Delivery Information</h2>

              <div className="space-y-4">
                <Field label="Full name" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" />
                <Field label="Email address" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" type="email" />
                <Field label="Phone number" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" type="tel" />

                {/* Saved addresses */}
                {!loadingAddresses && savedAddresses.length > 0 && (
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-2">Deliver to</label>
                    <div className="space-y-2">
                      {savedAddresses.map(addr => (
                        <div
                          key={addr.id}
                          onClick={() => selectSavedAddress(addr)}
                          className={`border rounded-xl px-4 py-3 cursor-pointer transition ${
                            selectedAddressId === addr.id
                              ? "border-blue-400 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <p className="text-sm font-medium text-slate-900">
                            {addr.full_name} {addr.is_default && <span className="text-xs text-blue-500 font-normal">· Default</span>}
                          </p>
                          <p className="text-sm text-slate-500">
                            {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      ))}
                      <div
                        onClick={useNewAddress}
                        className={`border rounded-xl px-4 py-3 cursor-pointer text-sm font-medium transition ${
                          selectedAddressId === "new"
                            ? "border-blue-400 bg-blue-50 text-blue-600"
                            : "border-dashed border-slate-300 text-slate-500 hover:border-slate-400"
                        }`}
                      >
                        + Use a new address
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual address fields — shown when no saved addresses, or "new" is selected */}
                {selectedAddressId === "new" && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <Field label="Address line" name="addressLine" value={form.addressLine} onChange={handleChange} placeholder="House no, street, area" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="City" />
                      <Field label="State" name="state" value={form.state} onChange={handleChange} placeholder="State" />
                    </div>
                    <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" />

                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveThisAddress}
                        onChange={(e) => setSaveThisAddress(e.target.checked)}
                        className="cursor-pointer"
                      />
                      Save this address for next time
                    </label>
                  </div>
                )}
              </div>

              <button
                onClick={openRazorpay}
                disabled={!canPay}
                className="mt-6 w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                {loading ? "Opening payment..." : `Pay ₹${total.toFixed(2)}L via Razorpay`}
              </button>

              <button
                onClick={() => navigate("/")}
                className="mt-3 w-full py-2.5 border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500 rounded-xl text-sm transition cursor-pointer"
              >
                ← Back to shop
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
              <p className="text-slate-500 mb-6">
                Your order is confirmed. Our team will contact you within 24 hours to arrange delivery.
              </p>
              <div className="bg-blue-50 rounded-xl p-4 inline-block mb-6">
                <p className="text-xs text-slate-400 mb-1">Order ID</p>
                <p className="text-lg font-bold text-blue-500">
                  #MTS-{Math.floor(100000 + Math.random() * 900000)}
                </p>
              </div>
              <br />
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {step === 0 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {checkoutCart.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/products/${item.id}`)} className="flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                      {item.type === 2 ? "🏍" : "🚗"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-400">Qty {item.qty}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-500">
                      ₹{(item.price * item.qty).toFixed(2)}L
                    </span>
                    {!buyNowItem && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.id) }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition cursor-pointer text-base"
                      >🗑</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-700">₹{checkoutCartTotal.toFixed(2)}L</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>GST (18%)</span>
                  <span className="text-slate-700">₹{gst.toFixed(2)}L</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Delivery</span>
                  <span className="text-green-500 font-medium">Free</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-blue-500 text-lg">₹{total.toFixed(2)}L</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs text-slate-500 font-medium block mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition"
      />
    </div>
  )
}

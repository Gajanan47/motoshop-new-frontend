import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMyAddresses, addAddress, deleteAddress, setDefaultAddress } from '../api/addresses'

const emptyForm = {
  full_name: "", phone: "", address_line: "", city: "", state: "", pincode: ""
}

const Addresses = () => {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetchMyAddresses()
      setAddresses(res.data.data || [])
    } catch (err) {
      console.log("Failed to load addresses:", err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      await addAddress({ ...form, is_default: addresses.length === 0 })
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || "Could not save address")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this address?")) return
    try {
      await deleteAddress(id)
      load()
    } catch (err) {
      console.log("Delete failed:", err.message)
    }
  }

  async function handleSetDefault(id) {
    try {
      await setDefaultAddress(id)
      load()
    } catch (err) {
      console.log("Could not set default:", err.message)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="text-sm mb-4">
          <span onClick={() => navigate('/profile')} className="text-blue-600 hover:underline cursor-pointer">
            Your Account
          </span>
          <span className="text-slate-400 mx-2">›</span>
          <span className="text-orange-600">Your Address</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-medium text-slate-900">Your Addresses</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm px-4 py-2 border border-slate-400 rounded-full hover:bg-slate-50 transition cursor-pointer"
            >
              + Add address
            </button>
          )}
        </div>

        {/* Add address form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="border border-slate-200 rounded-md p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Add a new address</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name" name="full_name" value={form.full_name} onChange={handleChange} required />
              <Field label="Phone number" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <Field label="Address line" name="address_line" value={form.address_line} onChange={handleChange} placeholder="House no, street, area" required />
            <div className="grid grid-cols-3 gap-4">
              <Field label="City" name="city" value={form.city} onChange={handleChange} required />
              <Field label="State" name="state" value={form.state} onChange={handleChange} required />
              <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} required />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); setError("") }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm hover:border-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                {saving ? "Saving..." : "Save address"}
              </button>
            </div>
          </form>
        )}

        {/* Address list */}
        {loading ? (
          <p className="text-slate-400 text-sm">Loading addresses...</p>
        ) : addresses.length === 0 && !showForm ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">📍</div>
            <p>You haven't saved any addresses yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="border border-slate-200 rounded-md p-5">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900">{addr.full_name}</p>
                  {addr.is_default === 1 || addr.is_default === true ? (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                      Default
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-slate-600">{addr.phone}</p>
                <p className="text-sm text-slate-600 mb-4">
                  {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <div className="flex gap-2">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs border border-slate-300 rounded-full px-3 py-1.5 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-xs border border-slate-300 rounded-full px-3 py-1.5 hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="text-xs text-slate-500 font-medium block mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition"
      />
    </div>
  )
}

export default Addresses
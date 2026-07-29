import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { adminLogin } from "../api/admin"

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await adminLogin(form)
      // save token to localStorage
      localStorage.setItem("adminToken", res.data.token)
      localStorage.setItem("adminEmail", res.data.admin.email)
      // redirect to dashboard
      navigate("/admin")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center  p-4 sm:p-5">
      <div className="bg-white rounded-2xl shadow-sm w-full max-w-sm p-6 sm:p-8">

        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl font-medium tracking-tight">
            MOTO<span className="text-orange-500">SHOP</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Admin Panel</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-xs sm:text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@motoshop.com"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 transition"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition cursor-pointer shadow-xs"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-6 tracking-wide">
          MotoShop Admin — restricted access
        </p>
      </div>
    </div>
  )
}
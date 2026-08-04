import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../api/axios"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Both fields are required.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      const res = await API.post("/users/login", { email, password })
      localStorage.removeItem("userName")
      const token = res.data.token
      const user = res.data.user
      localStorage.setItem("userToken", token)
      localStorage.setItem("userName", user.name)
      localStorage.setItem("userEmail", user.email)
      navigate("/welcome")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check entered data and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-100 flex items-center justify-center px-5 py-10">
      <section className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight  text-[#005ab4] ">
            MotoShop
          </h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to continue shopping and track your orders.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide blue-500">Welcome back</span>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="mt-1 text-sm text-slate-500">Use your MotoShop account details below.</p>
          </div>

          <div>
            <label htmlFor="email" className="text-xs text-slate-500 font-medium block mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs text-slate-500 font-medium block mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-16 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-500 hover:text-blue-600 px-2 py-1 rounded-lg"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-500"
              />
              Remember me
            </label>
            <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium">Create account</Link>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-slate-500">
            New here? <Link to="/register" className="font-medium text-blue-500 hover:text-blue-600">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default LoginForm

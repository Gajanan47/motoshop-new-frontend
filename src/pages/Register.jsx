import React, { useState } from "react"
import API from "../api/axios"
import { useNavigate, Link } from "react-router-dom"
// import Navbar from "../components/Navbar"

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!name || !email || !password) {
      setError("All fields are required")
      return
    }

    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*[0-9]).{10,}/.test(password)) {
      setError("Password must be 10 characters with 1 uppercase letter, 1 lowercase letter, 1 special character and 1 number")
      return
    }

    setLoading(true)
    try {
      const res = await API.post("/users/register", {
        name,
        email,
        password
      })
      setMessage(`${res.data.message}. Redirecting to login...`)
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (<>
    
    
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-100 flex items-center justify-center px-5 py-10">
      
      <section className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            MOTO<span className="blue-500">SHOP</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">Create your account to save orders and view purchase history.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">Get started</span>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500">Fill in the details below to register.</p>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Write your name here"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Write your email here"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Phone number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Write your name here"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Write your password here"
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
            <p className="mt-1 text-xs text-slate-400">Use 10+ characters with uppercase, lowercase, number and special character.</p>
          </div>

          {message && (
            <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition cursor-pointer"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-medium text-blue-500 hover:text-blue-600">Login here</Link>
          </p>
        </form>
      </section>
    </main>
    </>
  )
}

export default Register

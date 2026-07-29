import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyPassword } from '../api/users'

const ReAuth = () => {
    const navigate = useNavigate()
    const [pass, setPass] = useState("")
    const [error, setError] = useState("")
    const [loading, setloading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setloading(true)
        try {
            await verifyPassword(pass)
            sessionStorage.setItem("reauth-login-security", Date.now().toString())
            navigate('/account/login-security')
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setloading(false)
        }
    }
    return (

        <main className="min-h-[calc(100vh-3.5rem)] bg-slate-100 flex items-center justify-center px-5 py-10">
            <section className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        MOTO<span className="text-orange-500">SHOP</span>
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Confirm your password to continue.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                            Security check
                        </span>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Sign in again
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            For your security, please enter your password before changing account details.
                        </p>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 font-medium block mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            required
                            placeholder="Enter your password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 transition"
                        />
                    </div>

                    {error && (
                        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition cursor-pointer"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="w-full py-2.5 border border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-500 rounded-xl text-sm transition cursor-pointer"
                    >
                        Back to account
                    </button>
                </form>
            </section>
        </main>
    )
}

export default ReAuth
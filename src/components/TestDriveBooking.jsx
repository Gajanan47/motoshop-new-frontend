import { useState, useEffect } from "react"
import { MdCalendarMonth, MdCheckCircle, MdPhone, MdSchedule } from "react-icons/md"
import { bookTestDrive } from "../api/testDrives"
import {fetchMe} from "../api/users"
const timeSlots = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"]

function getEarliestBookingDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split("T")[0]
}
const names = localStorage.getItem("userName")

export default function TestDriveBooking({ product }) {
  const [form, setForm] = useState({
    name: names ? names:"",
    phone: "",
    date: "",
    timeSlot: timeSlots[0],
    showroom: "MotoShop Showroom",
  })

  const name = localStorage.getItem("userName")
  // const phone = localStorage.getItem(user)

  const [status, setStatus] = useState("idle")
  const [error, setError] = useState("")

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus("submitting")
    setError("")

    try {
      await bookTestDrive({ productId: product.id, ...form })
      setStatus("success")
    } catch (requestError) {
      setStatus("idle")
      setError(requestError.response?.data?.message || "We couldn't book your test ride. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <aside className="rounded-3xl border border-[#b9d7ff] bg-[#eef6ff] p-6 sm:p-8" aria-live="polite">
        <MdCheckCircle className="mb-4 text-4xl text-[#004ac6]" />
        <h3 className="text-xl font-extrabold text-[#191c1e]">Test ride requested</h3>
        <p className="mt-2 leading-relaxed text-[#434655]">
          We’ll call <span className="font-semibold text-[#191c1e]">{form.phone}</span> to confirm your {form.date} {form.timeSlot} slot for {product.name}.
        </p>
      </aside>
    )
  }
  useEffect(() => {
      async function loadAccountDetails() {
        try {
          const res = await fetchMe()
          const user = res.data.data
          setForm((prev) => ({
            ...prev,
            name: user.name || prev.name,
            phone: user.phone || prev.phone,
          }))
        } catch (err) {
          console.log("Could not load account details:", err.message)
        }
      }
      loadAccountDetails()
    }, [])

  return (
    <aside className="rounded-3xl border border-[#e0e3e5] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e8f0ff] text-[#004ac6]">
          <MdCalendarMonth className="text-2xl" />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#9d4300]">Experience it first</p>
          <h3 className="mt-1 text-xl font-extrabold text-[#191c1e]">Book a test ride</h3>
          <p className="mt-1 text-sm text-[#434655]">Choose a convenient time. We’ll call to confirm your slot.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold text-[#434655]">
            Your name
            <Field name="name" value={form.name} onChange={updateField} required autoComplete="name" placeholder={name} className="h-11 rounded-xl border border-[#cfd3d7] bg-white px-3 text-[#191c1e] outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15" />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-[#434655]">
            Phone number
            <input name="phone" value={form.phone} onChange={updateField} required inputMode="tel" autoComplete="tel" pattern="[0-9+ -]{7,20}" title="Enter a valid phone number" placeholder="Phone number" className="h-11 rounded-xl border border-[#cfd3d7] bg-white px-3 text-[#191c1e] outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold text-[#434655]">
            Preferred date
            <input name="date" type="date" value={form.date} onChange={updateField} min={getEarliestBookingDate()} required className="h-11 rounded-xl border border-[#cfd3d7] bg-white px-3 text-[#191c1e] outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15" />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-[#434655]">
            Preferred time
            <span className="relative">
              <MdSchedule className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#434655]" />
              <select name="timeSlot" value={form.timeSlot} onChange={updateField} className="h-11 w-full appearance-none rounded-xl border border-[#cfd3d7] bg-white py-0 pl-10 pr-3 text-[#191c1e] outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15">
                {timeSlots.map((timeSlot) => <option key={timeSlot}>{timeSlot}</option>)}
              </select>
            </span>
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-semibold text-[#434655]">
          Showroom
          <select name="showroom" value={form.showroom} onChange={updateField} className="h-11 rounded-xl border border-[#cfd3d7] bg-white px-3 text-[#191c1e] outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15">
            <option>MotoShop Showroom</option>
          </select>
        </label>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

        <button type="submit" disabled={status === "submitting"} className="mt-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#004ac6] font-bold text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-70">
          <MdPhone className="text-lg" />
          {status === "submitting" ? "Requesting…" : "Request test ride"}
        </button>
      </form>
    </aside>
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
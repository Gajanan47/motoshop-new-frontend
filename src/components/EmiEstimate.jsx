import { useState, useMemo } from "react"
import { MdExpandMore, MdExpandLess } from "react-icons/md"

const DEFAULT_INTEREST_RATE = 9.5 // % per annum — indicative, not a real lender quote
const TENURE_OPTIONS = [12, 24, 36, 48, 60]
const DOWN_PAYMENT_OPTIONS = [10, 15, 20, 25, 30]

function calculateEmi(priceInLakhs, downPaymentPercent, tenureMonths, annualRate) {
  const principal = Number(priceInLakhs) * 100000 * (1 - downPaymentPercent / 100)
  const monthlyRate = annualRate / 12 / 100
  if (monthlyRate === 0) return principal / tenureMonths
  const factor = Math.pow(1 + monthlyRate, tenureMonths)
  return (principal * monthlyRate * factor) / (factor - 1)
}

export default function EmiEstimate({ price }) {
  const [open, setOpen] = useState(false)
  const [downPayment, setDownPayment] = useState(15)
  const [tenure, setTenure] = useState(36)

  const emi = useMemo(
    () => calculateEmi(price, downPayment, tenure, DEFAULT_INTEREST_RATE),
    [price, downPayment, tenure]
  )

  if (!price) return null

  return (
    <div className="border border-[#e0e3e5] rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#eceef0] hover:bg-[#e6e8ea] transition cursor-pointer"
      >
        <span className="text-sm text-[#434655]">
          EMI starts at{" "}
          <span className="font-bold text-[#191c1e]">
            ₹{Math.round(emi).toLocaleString("en-IN")}/mo
          </span>
        </span>
        {open ? <MdExpandLess className="text-lg text-[#434655]" /> : <MdExpandMore className="text-lg text-[#434655]" />}
      </button>

      {open && (
        <div className="p-4 bg-white space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#434655] block mb-1">Down payment</label>
              <select
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full border border-[#e0e3e5] rounded-lg px-2 py-1.5 text-sm cursor-pointer"
              >
                {DOWN_PAYMENT_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}%</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[#434655] block mb-1">Tenure</label>
              <select
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full border border-[#e0e3e5] rounded-lg px-2 py-1.5 text-sm cursor-pointer"
              >
                {TENURE_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m} months</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-[11px] text-[#434655] leading-relaxed">
            Indicative estimate at {DEFAULT_INTEREST_RATE}% p.a., assuming a {downPayment}% down payment over {tenure} months.
            Actual EMI depends on lender terms and credit approval.
          </p>
        </div>
      )}
    </div>
  )
}
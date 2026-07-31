import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

const vehicleTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "2", label: "Two Wheeler" },
  { value: "4", label: "Four Wheeler" },
]
const ccOptions = [
  { value: "all", label: "All" },
  { value: "150", label: "Up to 150cc" },
  { value: "250", label: "151 – 250cc" },
  { value: "500", label: "251 – 500cc" },
  { value: "501", label: "500cc+" },
]
const brandOptions = ["all", "Honda", "Yamaha", "Royal Enfield", "KTM", "Bajaj", "Tata", "Hyundai"]
const fuelOptions = ["all", "Petrol", "Electric", "Diesel", "CNG"]
const useOptions = ["all", "Commuter", "Sport", "Adventure", "Family"]

const defaultFilters = {
  type: "all",
  cc: "all",
  brand: "all",
  price: 30,
  fuel: "all",
  use: "all",
}

function labelFor(key, filters) {
  switch (key) {
    case "type":
      return vehicleTypeOptions.find((o) => o.value === filters.type)?.label || "Vehicle Type"
    case "cc":
      return ccOptions.find((o) => o.value === filters.cc)?.label === "All" ? "Engine CC" : ccOptions.find((o) => o.value === filters.cc)?.label
    case "brand":
      return filters.brand === "all" ? "Brand" : filters.brand
    case "price":
      return filters.price === 30 ? "Budget" : `≤ ₹${filters.price}L`
    case "fuel":
      return filters.fuel === "all" ? "Fuel System" : filters.fuel
    case "use":
      return filters.use === "all" ? "Use Case" : filters.use
    default:
      return ""
  }
}

function Dropdown({ id, label, open, onToggle, children }) {
  const btnRef = useRef(null)
  const [coords, setCoords] = useState(null)

  // Recalculate the panel's position off the trigger button whenever it
  // opens, and keep it pinned while the filter bar scrolls horizontally
  // or the window scrolls/resizes.
  useLayoutEffect(() => {
    if (!open) return

    function updateCoords() {
      const rect = btnRef.current?.getBoundingClientRect()
      if (rect) setCoords({ top: rect.bottom + 8, left: rect.left })
    }

    updateCoords()
    window.addEventListener("scroll", updateCoords, true)
    window.addEventListener("resize", updateCoords)
    return () => {
      window.removeEventListener("scroll", updateCoords, true)
      window.removeEventListener("resize", updateCoords)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => onToggle(id)}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition cursor-pointer whitespace-nowrap
          ${open ? "border-blue-500 text-blue-600 bg-blue-50" : "border-slate-200 text-slate-700 hover:border-blue-300"}`}
      >
        {label}
        <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && coords && createPortal(
        <div
          style={{ position: "fixed", top: coords.top, left: coords.left }}
          className="w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-2 max-h-72 overflow-y-auto"
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  )
}

function Option({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-sm rounded-md transition cursor-pointer
        ${active ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
    >
      {children}
    </button>
  )
}

export default function Sidebar({ filters, setFilters, resultCount }) {
  const [openDropdown, setOpenDropdown] = useState(null)
  const containerRef = useRef(null)

  function set(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function toggle(id) {
    setOpenDropdown((prev) => (prev === id ? null : id))
  }

  // close any open dropdown when clicking outside the filter bar
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      className="sticky top-20 z-40 flex flex-nowrap items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none border-b border-slate-200/70 bg-[#f2f4f6]/85 px-4 py-3 sm:px-8 sm:py-4 lg:px-16 backdrop-blur-md"
    >
      <span className="flex items-center gap-1.5 text-blue-600 font-semibold uppercase text-xs tracking-widest shrink-0">
        ⚙ Filter System
      </span>

      <Dropdown id="type" label={labelFor("type", filters)} open={openDropdown === "type"} onToggle={toggle}>
        {vehicleTypeOptions.map((o) => (
          <Option key={o.value} active={filters.type === o.value} onClick={() => { set("type", o.value); setOpenDropdown(null) }}>
            {o.label}
          </Option>
        ))}
      </Dropdown>

      <Dropdown id="cc" label={labelFor("cc", filters)} open={openDropdown === "cc"} onToggle={toggle}>
        {ccOptions.map((o) => (
          <Option key={o.value} active={filters.cc === o.value} onClick={() => { set("cc", o.value); setOpenDropdown(null) }}>
            {o.label}
          </Option>
        ))}
      </Dropdown>

      <Dropdown id="brand" label={labelFor("brand", filters)} open={openDropdown === "brand"} onToggle={toggle}>
        {brandOptions.map((b) => (
          <Option key={b} active={filters.brand === b} onClick={() => { set("brand", b); setOpenDropdown(null) }}>
            {b === "all" ? "All brands" : b}
          </Option>
        ))}
      </Dropdown>

      <Dropdown id="price" label={labelFor("price", filters)} open={openDropdown === "price"} onToggle={toggle}>
        <div className="px-2 py-2">
          <input
            type="range" min="1" max="30" step="1"
            value={filters.price}
            onChange={(e) => set("price", Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>₹0L</span>
            <span className="text-blue-600 font-semibold">≤ ₹{filters.price}L</span>
          </div>
        </div>
      </Dropdown>

      <Dropdown id="fuel" label={labelFor("fuel", filters)} open={openDropdown === "fuel"} onToggle={toggle}>
        {fuelOptions.map((f) => (
          <Option key={f} active={filters.fuel === f} onClick={() => { set("fuel", f); setOpenDropdown(null) }}>
            {f === "all" ? "All" : f}
          </Option>
        ))}
      </Dropdown>

      <Dropdown id="use" label={labelFor("use", filters)} open={openDropdown === "use"} onToggle={toggle}>
        {useOptions.map((u) => (
          <Option key={u} active={filters.use === u} onClick={() => { set("use", u); setOpenDropdown(null) }}>
            {u === "all" ? "All" : u}
          </Option>
        ))}
      </Dropdown>

      <button
        onClick={() => { setFilters(defaultFilters); setOpenDropdown(null) }}
        className="text-sm font-medium text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
      >
        Reset
      </button>

      <span className="ml-auto text-xs font-semibold uppercase tracking-widest text-slate-400 shrink-0">
        Showing {resultCount} {resultCount === 1 ? "result" : "results"}
      </span>
    </div>
  )
}
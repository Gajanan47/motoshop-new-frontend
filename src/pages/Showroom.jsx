import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { fetchProducts } from "../api/products"
import SideBar from "../components/SideBar"
import ProductGrid from "../components/ProductGrid"

const defaultFilters = { type: "all", cc: "all", brand: "all", price: 100, fuel: "all", use: "all" }

const sortOptions = [
  { value: "trending", label: "Trending" },
  { value: "latest", label: "Latest Launches" },
  { value: "topcc", label: "Top CC" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
]

function sortLabel(value) {
  return sortOptions.find((o) => o.value === value)?.label || "Trending"
}

function sortProducts(products, sort) {
  const list = [...products]
  switch (sort) {
    case "latest":
      return list.sort((a, b) => b.id - a.id)
    case "topcc":
      return list.sort((a, b) => (b.cc || 0) - (a.cc || 0))
    case "price-low":
      return list.sort((a, b) => a.price - b.price)
    case "price-high":
      return list.sort((a, b) => b.price - a.price)
    case "trending":
    default:
      return list.sort((a, b) => (b.rating || 0) * (b.reviews || 0) - (a.rating || 0) * (a.reviews || 0))
  }
}

export default function Showroom() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [searchParams, setSearchParams] = useSearchParams()

  const sort = searchParams.get("sort") || "trending"
  const searchQuery = searchParams.get("search") || ""

  useEffect(() => {
    fetchProducts()
      .then((res) => setProducts(res.data.data || []))
      .catch(() => setError("We couldn't load the showroom. Please try again."))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => products.filter((p) => {
    const query = searchQuery.trim().toLowerCase()
    if (query && !`${p.name} ${p.company}`.toLowerCase().includes(query)) return false
    if (filters.type !== "all" && String(p.type) !== filters.type) return false
    if (filters.brand !== "all" && p.company !== filters.brand) return false
    if ((filters.price < 100 && p.price > filters.price) || (filters.fuel !== "all" && p.fuel !== filters.fuel) || (filters.use !== "all" && p.use_case !== filters.use)) return false
    if (filters.cc === "150" && p.cc > 150) return false
    if (filters.cc === "250" && (p.cc < 151 || p.cc > 250)) return false
    if (filters.cc === "500" && (p.cc < 251 || p.cc > 500)) return false
    if (filters.cc === "501" && p.cc <= 500) return false
    return true
  }), [filters, products, searchQuery])

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort])

  function handleSortChange(value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("sort", value)
      return next
    })
  }

  if (loading) return <div className="grid min-h-[70vh] place-items-center bg-[#f7f9fb] text-slate-500">
    Loading the showroom…
  </div>
  if (error) return <div className="grid min-h-[70vh] place-items-center bg-[#f7f9fb] text-red-600">
    {error}
  </div>

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <SideBar filters={filters} setFilters={setFilters} resultCount={sorted.length} />
      <main className="mx-auto max-w-[1720px] px-5 pb-24 pt-8 sm:px-8 lg:px-16">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600">
              Full Catalogue
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Showroom</h1>
            {searchQuery && (
              <p className="mt-2 text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-800">{sorted.length}</span> matches for “{searchQuery}”
              </p>
            )}
          </div>

          <label className="flex shrink-0 items-center gap-2 text-sm text-slate-600">
            Sort by
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label={`Sort by ${sortLabel(sort)}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        <ProductGrid products={sorted} />
      </main>
    </div>
  )
}
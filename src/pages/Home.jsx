import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FaArrowRight, FaHeart, FaRegHeart, FaPlus } from "react-icons/fa"
import { fetchProducts } from "../api/products"
import { useCart } from "../context/CartContext"
import { useWishlist } from "../context/WishlistContext"
import { useCompare } from "../context/CompareContext"
import Hero from "../components/Hero"
import SideBar from "../components/SideBar"
import { MdCompareArrows } from "react-icons/md"

const defaultFilters = { type: "all", cc: "all", brand: "all", price: 30, fuel: "all", use: "all" }

function money(price) {
  return `₹${Number(price || 0).toLocaleString()}L`
}

function BikeCard({ product, compact = false }) {
  const navigate = useNavigate()
  const { addToCart, cart, removeFromCart } = useCart()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const { isInCompare, toggleCompare } = useCompare()
  const liked = wishlistIds.has(product.id)
  const comparing = isInCompare(product.id)
  const cartItem = cart.find((item) => item.id === product.id)
  const qty = cartItem ? cartItem.qty : 0

  if (!product) return null
  return (
    <article onClick={() => navigate(`/products/${product.id}`)} className={`group relative overflow-hidden rounded-3xl border cursor-pointer border-slate-200/70 bg-white transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] ${compact ? "min-w-[292px]" : "min-w-[340px]"}`}>
      <div className={`${compact ? "h-40" : "h-52"} overflow-hidden bg-slate-100`}>
        <img src={product.image} alt={product.name} className="h-full w-full object-cover p-3 transition duration-700 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">{product.company}</p>
            <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">{product.name}</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={(event) => { event.stopPropagation(); toggleCompare(product) }}
              aria-label="Toggle compare"
              className={`rounded-full p-2 transition ${comparing ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-blue-50 hover:text-blue-500"}`}
            >
              <MdCompareArrows />
            </button>
            <button aria-label="Toggle wishlist" onClick={(event) => { event.stopPropagation(); toggleWishlist(product) }} className="rounded-full p-2 text-slate-400 transition hover:bg-orange-50 hover:text-red-500">
              {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            </button>
          </div>
        </div>
        <p className="min-h-10 text-sm leading-5 text-slate-500">{product.description || `${product.use_case || "Premium"} performance, engineered for every ride.`}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
          <span className="rounded bg-slate-100 px-2 py-1">{product.cc} CC</span>
          <span className="rounded bg-slate-100 px-2 py-1">{product.fuel}</span>
          <span className="rounded bg-slate-100 px-2 py-1">{product.use_case || "Road"}</span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Starting at
            </p>
            <p className="font-bold text-[#005ab4]">
              {money(product.price)}
            </p>
          </div>

          {qty === 0 ? (
            <button onClick={(e) => { e.stopPropagation(); addToCart(product) }} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-[#005ab4] hover:text-white transition">
              <FaPlus className="text-xs" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }} className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-500 flex items-center justify-center">−</button>
              <span className="text-sm font-bold min-w-4 text-center">{qty}</span>
              <button onClick={(e) => { e.stopPropagation(); addToCart(product) }} className="w-7 h-7 rounded-full bg-[#005ab4] text-white flex items-center justify-center">+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function Row({ eyebrow, title, products, compact }) {
  return (
    <section className="py-12">
      <div className="mb-6 flex items-end justify-between">
        <div><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600">{eyebrow}</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
        </div>
        <button onClick={() => alert('coming soon...')} className="hidden items-center gap-2 font-semibold cursor-pointer text-[#005ab4] sm:flex">
          View all <FaArrowRight className="text-xs" />
        </button>
      </div>
      <div className="scrollbar-none -mx-5 flex snap-x gap-6 overflow-x-auto px-5 pb-5 sm:-mx-8 sm:px-8 lg:-mx-0 lg:px-0">
        {products.map((product) => <BikeCard key={product.id} product={product} compact={compact} />)}
      </div>
    </section>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const { addToCart, removeFromCart, cart } = useCart()
  const { isInCompare, toggleCompare, } = useCompare()
  const { wishlistIds, toggleWishlist } = useWishlist()

  useEffect(() => {
    fetchProducts().then((res) => setProducts(res.data.data || [])).catch(() => setError("We couldn't load the showroom. Please try again.")).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => products.filter((p) => {
    const query = searchQuery.trim().toLowerCase()
    if (query && !`${p.name} ${p.company}`.toLowerCase().includes(query)) return false
    if (filters.type !== "all" && String(p.type) !== filters.type) return false
    if (filters.brand !== "all" && p.company !== filters.brand) return false
    if (p.price > filters.price || (filters.fuel !== "all" && p.fuel !== filters.fuel) || (filters.use !== "all" && p.use_case !== filters.use)) return false
    if (filters.cc === "150" && p.cc > 150) return false
    if (filters.cc === "250" && (p.cc < 151 || p.cc > 250)) return false
    if (filters.cc === "500" && (p.cc < 251 || p.cc > 500)) return false
    if (filters.cc === "501" && p.cc <= 500) return false
    return true
  }), [filters, products, searchQuery])

  if (loading) return <div className="grid min-h-[70vh] place-items-center bg-[#f7f9fb] text-slate-500">
    Loading your showroom…
  </div>
  if (error) return <div className="grid min-h-[70vh] place-items-center bg-[#f7f9fb] text-red-600">
    {error}
  </div>

  const feature = filtered[2] || products[2]
  const sideProducts = (filtered.length ? filtered : products).slice(1, 4)
  const catalogue = filtered.length ? filtered : products

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">

      <Hero />
      <marquee direction = 'left' speed= '5' behavior = "scroll"  className="text-orange-600 " onMouseOver={(e) => e.currentTarget.stop()}
  onMouseOut={(e) => e.currentTarget.start()}>
        
      </marquee>
      <SideBar filters={filters} setFilters={setFilters} resultCount={filtered.length} />
      <main id="inventory" className="mx-auto max-w-[1440px] px-5 pb-24 pt-10 sm:px-8 lg:px-16">
        {searchQuery && <p className="mb-6 text-sm text-slate-500">
          Showing
          <span className="font-semibold text-slate-800">
            {filtered.length}
          </span>
          matches for “{searchQuery}”
        </p>}
        {feature && <section>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600">
                Curation
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trending Now
              </h1>
            </div>
            <button onClick={() => alert('Comin soon...')} className="hidden items-center gap-2 
                font-semibold text-[#005ab4] sm:flex">
              View all <FaArrowRight className="text-xs" />
            </button>
          </div>
          <div className="grid gap-6 lg:grid-cols-10 lg:min-h-[560px]">
            <article onClick={() => navigate(`/products/${feature.id}`)}
              className="group relative min-h-[480px] cursor-pointer overflow-hidden rounded-3xl bg-slate-900 lg:col-span-6">
              <img src={feature.image} alt={feature.name}
                className="absolute inset-0 h-full w-full object-cover p-6 opacity-90 transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                  Featured model
                </span>
                <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                  {feature.name}
                </h2>
                <p className="mt-2 max-w-xl text-white/75">
                  {feature.description || "Discover premium performance, crafted for the road ahead."}
                </p>
                <div className="mt-6 flex gap-10 text-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                      Engine
                    </p>
                    <p className="mt-1 font-semibold">
                      {feature.cc} CC
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                      Fuel
                    </p>
                    <p className="mt-1 font-semibold">
                      {feature.fuel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                      From
                    </p>
                    <p className="mt-1 font-semibold">
                      {money(feature.price)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
            <div className="grid gap-6 lg:col-span-4 lg:grid-rows-3">{sideProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id)
              const qty = cartItem ? cartItem.qty : 0
              const liked = wishlistIds.has(product.id)
              const comparing = isInCompare(product.id)

              return (
                <article onClick={() => navigate(`/products/${product.id}`)} key={product.id} className="group flex min-h-40 cursor-pointer gap-5 rounded-3xl border border-slate-200/70 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-29 h-28 rounded-2xl bg-slate-100 flex items-center justify-center p-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">{product.use_case || product.company}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(event) => { event.stopPropagation(); toggleCompare(product) }}
                            aria-label="Toggle compare"
                            className={`rounded-full p-2 transition ${isInCompare(product.id)
                              ? 'bg-[#004ac6] border-[#004ac6] text-white'
                              : 'bg-white border-[#e0e3e5] text-[#434655]'}`}
                          >
                            <MdCompareArrows />
                          </button>
                          <button aria-label="Toggle wishlist" onClick={(event) => { event.stopPropagation(); toggleWishlist(product) }} className="rounded-full p-2 text-slate-400 transition hover:bg-orange-50 hover:text-red-500">
                            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#005ab4]">
                        {money(product.price)}
                      </span>

                      {qty === 0 ? (
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-[#005ab4] hover:text-white">
                          +
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }} className="border rounded-full border-blue-50 px-2 bg-blue-50 hover:bg-blue-600">
                            –
                          </button>
                          <span>
                            {qty}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); addToCart(product) }} className="border rounded-full border-blue-50 px-2 bg-blue-50 hover:bg-blue-600">
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
            </div>
          </div>
        </section>}
        <Row eyebrow="New arrivals" title="Latest Launches" products={catalogue.slice(0, 6)} />
        <Row eyebrow="Pure power" title="Top CC Motorcycles" products={[...catalogue].sort((a, b) => (b.cc || 0) - (a.cc || 0)).slice(0, 6)} />
        <section className="mt-10 rounded-3xl bg-[#2d3133] px-6 py-12 text-white sm:px-10"><div className="grid gap-8 lg:grid-cols-2"><div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-300">
            Exclusivity
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Premium Collection
          </h2>
          <p className="mt-3 max-w-lg text-white/65">
            A hand-picked selection of exceptional machines for riders who expect more from every mile.
          </p>
          <button className="mt-7 rounded-full bg-[#aac7ff] px-6 py-3 text-sm font-bold text-[#001b3e]">
            Explore collection
          </button>
        </div>
          <div className="grid grid-cols-2 gap-4">
            {catalogue.slice(0, 2).map((p) => <div key={p.id}
              className="overflow-hidden rounded-2xl bg-white/10">
              <img src={p.image} alt={p.name} className="h-36 w-full object-cover p-3" />
              <p className="px-4 pb-4 font-semibold">
                {p.name}
              </p>
            </div>
            )}
          </div>
        </div>
        </section>
      </main>
    </div>
  )
}
import ProductCard from "./ProductCard"
import React, { useState, useEffect } from "react"

export default function ProductGrid({ products }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 16;
  const indexOfLastItem = itemsPerPage * currentPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const displayedProducts = products.slice(indexOfFirstItem, indexOfLastItem)

  useEffect(() => {
    setCurrentPage(1)
  }, [products])

  return (
    <main id="inventory" className="py-5">

      {/* <div className="flex items-center justify-between mb-5">
        <span className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">
          Showing <span className="text-slate-900">{products.length}</span> vehicles
        </span> */}
        {/* <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-1">
          <button className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center text-sm">▦</button>
          <button className="w-8 h-8 rounded-md text-slate-400 flex items-center justify-center text-sm hover:bg-slate-50">☰</button>
        </div> */}
      {/* </div> */}

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>No vehicles match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 ">
          {displayedProducts.map((product, index) => (
            <React.Fragment key={product.id}>
              <ProductCard product={product} />
              {/* promo tile after the 4th card on the first page, like the reference layout */}
              {currentPage === 1 && index === 3 && (
                <div className="relative rounded-xl overflow-hidden col-span-1 2xl:col-span-2 min-h-40 flex items-end p-5 text-white bg-blue-900">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558980664-10e7170b5df9?w=800&q=80')" }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-blue-950/90 to-blue-900/40" />
                  <div className="relative">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-cyan-300">Maintenance Unit</span>
                    <h3 className="text-lg font-bold mt-1 mb-1.5">Next-Gen Precision Service Protocols.</h3>
                    <p className="text-xs text-blue-100 mb-3 max-w-xs">
                      Real-time diagnostics and performance tuning, handled by our technical team.
                    </p>
                    {/* <button className="bg-white text-blue-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer">
                      Book Tech Service
                    </button> */}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
        <div className="flex justify-between w-full sm:w-auto items-center gap-2 order-2 sm:order-1">
          <button
            className="text-sm px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <button
            className="text-sm px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition"
            onClick={() => setCurrentPage(prev =>
              Math.min(prev + 1, Math.ceil(products.length / itemsPerPage))
            )}
            disabled={indexOfLastItem >= products.length}
          >
            Next →
          </button>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-0.5 text-sm text-slate-500 order-1 sm:order-2 w-full sm:w-auto">
          <span>
            Page <span className="font-medium text-slate-900">{currentPage}</span> of {Math.max(1, Math.ceil(products.length / itemsPerPage))}
          </span>
          <span className="text-xs text-slate-400">Total products: {products.length}</span>
        </div>
      </div>
    </main>
  )
}
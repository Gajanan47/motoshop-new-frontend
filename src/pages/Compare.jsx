import { useNavigate } from "react-router-dom"
import { useCompare } from "../context/CompareContext"
import { useCart } from "../context/CartContext"

const vehicleType = (type) => (type === 2 || type === "2" ? "Two-wheeler" : "Four-wheeler")

function StarRating({ rating }) {
  const stars = "★".repeat(Math.round(rating || 0)) + "☆".repeat(5 - Math.round(rating || 0))
  return <span className="text-blue-400">{stars}</span>
}

// returns "a" | "b" | "tie" — which product wins this spec, for highlighting
function winner(a, b, higherIsBetter) {
  if (a === b) return "tie"
  if (a == null || a === "") return "b"
  if (b == null || b === "") return "a"
  const numA = Number(a)
  const numB = Number(b)
  if (Number.isNaN(numA) || Number.isNaN(numB)) return "tie"
  if (numA === numB) return "tie"
  if (higherIsBetter) return numA > numB ? "a" : "b"
  return numA < numB ? "a" : "b"
}

export default function Compare() {
  const { compareList, clearCompare } = useCompare()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  if (compareList.length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-500 text-lg mb-4">
          Select two products to compare — pick them from the product grid using the compare icon.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-md transition cursor-pointer"
        >
          Browse products
        </button>
      </div>
    )
  }

  const [a, b] = compareList

  const priceWinner = winner(a.price, b.price, false) // lower price wins
  const ratingWinner = winner(a.rating, b.rating, true)
  const reviewsWinner = winner(a.reviews, b.reviews, true)
  const ccWinner = winner(a.cc, b.cc, true)

  const cellClass = (side, win) =>
    `px-4 py-3 text-sm ${win === side ? "bg-green-50 font-semibold text-green-700" : "text-slate-700"}`

  const rows = [
    { label: "Price", a: `₹${a.price}L`, b: `₹${b.price}L`, win: priceWinner },
    { label: "Rating", a: <><StarRating rating={a.rating} /> <span className="text-slate-500 text-xs">({a.rating})</span></>, b: <><StarRating rating={b.rating} /> <span className="text-slate-500 text-xs">({b.rating})</span></>, win: ratingWinner },
    { label: "Reviews", a: (a.reviews || 0).toLocaleString(), b: (b.reviews || 0).toLocaleString(), win: reviewsWinner },
    { label: "Company", a: a.company, b: b.company, win: "tie" },
    { label: "Type", a: vehicleType(a.type), b: vehicleType(b.type), win: "tie" },
    { label: "Engine / Fuel", a: a.fuel === "Electric" ? "Electric" : `${a.cc}cc · ${a.fuel}`, b: b.fuel === "Electric" ? "Electric" : `${b.cc}cc · ${b.fuel}`, win: a.fuel === "Electric" || b.fuel === "Electric" ? "tie" : ccWinner },
    { label: "Best for", a: a.use_case, b: b.use_case, win: "tie" },
    { label: "Badge", a: a.badge || "—", b: b.badge || "—", win: "tie" },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Compare Products</h1>
        <button
          onClick={clearCompare}
          className="text-sm text-slate-500 hover:text-red-500 cursor-pointer"
        >
          Clear comparison
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse min-w-150">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-4 text-left text-xs text-slate-400 font-medium w-32">Spec</th>
              {[a, b].map((product) => (
                <th key={product.id} className="px-4 py-4 text-left">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-20 object-contain bg-white rounded-md border border-slate-200 mb-2"
                  />
                  <p className="text-xs text-slate-400 uppercase">{product.company}</p>
                  <p className="font-semibold text-slate-900 text-sm mb-2">{product.name}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition cursor-pointer"
                  >
                    + ADD TO CART
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                <td className="px-4 py-3 text-xs font-medium text-slate-400">{row.label}</td>
                <td className={cellClass("a", row.win)}>{row.a}</td>
                <td className={cellClass("b", row.win)}>{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Highlighted cells show the better value for that spec. Ratings are based on customer reviews.
      </p>
    </div>
  )
}
import { useState, useEffect } from "react"
import { MdChevronLeft, MdChevronRight } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import img1 from "../assets/img1.png"
import img2 from "../assets/img2.png"
import img3 from "../assets/img3.png"
import img4 from "../assets/img4.png"
import img5 from "../assets/img5.png"
import img6 from "../assets/img6.png"
import img7 from "../assets/img7.png"
import img8 from "../assets/img8.png"
import img9 from "../assets/img9.png"
import img10 from "../assets/img10.png"


export default function Hero({ featured = [] }) {
  const navigate = useNavigate()
  const [currentImage, setCurrentImage] = useState(0);
  const sideItems = featured.slice(0, 2)
  const heroBg = [
    img1, 
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8,
    img9,
    img10,
    
  ];
  useEffect(() => {
    const interval = setInterval(()=>{
      setCurrentImage((prev)=>(prev+1) % heroBg.length)
    }, 4000);
  
    return () => {
      clearInterval(interval)
    }
  }, [])
  function goToNext(){
    setCurrentImage((prev)=>(prev + 1) % heroBg.length)
  }
  function goToPrev(){
    setCurrentImage((prev)=> (prev-1 + heroBg.length) % heroBg.length)
  }
  

  return (
    <div className="relative overflow-hidden bg-slate-950">
      {/* background image + dark gradient so text stays readable */}
      <div
        className="absolute inset-0 sm:bg-cover bg-contain bg-no-repeat  bg-center opacity-70"
        style={{
          backgroundImage:
            `url(${heroBg[currentImage]})`,
        }}
      />
      <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-transparent" />
      

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:items-end">
          {/* main hero content */}
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
              Precision Engineering Unit
            </span>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mt-4 leading-tight">
              Find Your <br />
              <span className="text-blue-400">Perfect Ride.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-md">
              Experience high-performance telemetry and clinical technical accuracy
              for your next automotive acquisition.
            </p>

            <div className="flex gap-6 sm:gap-10 mt-8">
              {[
                { num: "240+", label: "Models" },
                { num: "18", label: "Brands" },
                { num: "5.0 ★", label: "Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl sm:text-2xl font-bold text-white">{stat.num}</div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-lg transition cursor-pointer"
              >
                Explore Inventory
              </button>
              {/* <button
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-6 py-3 rounded-lg border border-white/20 transition cursor-pointer"
              >
                Technical Specs
              </button> */}
            </div>
          </div>

          {/* featured side cards — glass-panel style, built from real inventory (top of the fetched list) */}
          {sideItems.length > 0 && (
            <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                Featured Right Now
              </span>
              {sideItems.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="flex gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 cursor-pointer hover:bg-white/15 transition"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-white font-semibold truncate">{product.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{product.company}</p>
                    <p className="text-blue-400 font-bold text-sm mt-1">₹{product.price}L</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="items-center justify-center  mb-4 flex gap-4 ">
       
          <button
        onClick={goToPrev}
        aria-label="Previous background image"
        className=" z-10 -translate-y-1/2 px-2  h-9 w-9 sm:h-11 sm:w-11  rounded-full  text-white bg-transparent border border-white/20 transition hover:bg-white/20 cursor-pointer"
      >
        <MdChevronLeft className="text-2xl " />
      </button>
      <button
        onClick={goToNext}
        aria-label="Next background image"
        className=" bg-transparent  z-10 -translate-y-1/2 px-2  h-9 w-9 sm:h-11 sm:w-11  rounded-full  text-white  border border-white/20 transition hover:bg-white/20 cursor-pointer"
      >
        <MdChevronRight className="text-2xl" />
      </button>
        </div>
        
      </div>
    
  )
}
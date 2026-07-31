import { useState, useEffect } from 'react'
import { useCart } from "../context/CartContext"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import {fetchProducts} from '../api/products'
import { MdShoppingCart } from "react-icons/md";
import {MdAccountCircle} from "react-icons/md"
import NotificationBell from './NotificationBell'
export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart()
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [suggestions, setsuggestions] = useState([])
  const [products, setproducts] = useState([])
  const [logoDriving, setLogoDriving] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const name = localStorage.getItem("userName")
  const isLoginPage = location.pathname === '/login'
  const isHomePage = location.pathname === '/'

  // sync search input with URL param when on home page
  useEffect(() => {
    if (isHomePage) {
      setSearchInput(searchParams.get("search") || "")
    } else {
      setSearchInput("")
    }
  }, [location])

  useEffect(() => {
  async function loadProducts() {
    try {
      const response = await fetchProducts();

      // console.log("response =", response);
      // console.log("response.data =", response.data);
      // console.log("is array =", Array.isArray(response.data));

      setproducts(response.data.data);
    } catch (err) {
      console.error(err);
    }
  }

  loadProducts();
}, []);

// useEffect(() => {
//   console.log("Products state =", products);
//   console.log("Array?", Array.isArray(products));
// }, [products]);

  function handleSearchChange(e){
    // console.log("called")
    const value = e.target.value;
    setSearchInput(value);

    const words = value
      .toLowerCase()
      .trim()
      .split(/\s+/);

    
    if(!value.trim()){
      setsuggestions([])
      return;
    }
    // console.log(products);
    console.log("isArray:", Array.isArray(products));
    const filtered = products.filter(product =>{
        const searchable = `${product.company} ${product.name}`.toLowerCase()
        return words.every(word=>
          searchable.includes(word)
        );
    })
    setsuggestions(filtered.slice(0,5)) 
  }
  function handleSearch(e) {
    e.preventDefault()
    const q = searchInput.trim()
    if (q) {
      navigate(`/?search=${encodeURIComponent(q)}`)
    } else {
      navigate("/")
    }
  }

  function clearSearch() {
    setSearchInput("")
    if (isHomePage) navigate("/")
      setsuggestions([])
  }

  function handleLogoClick() {
    if (logoDriving) return // ignore repeat clicks mid-animation
    setLogoDriving(true)
    setTimeout(() => {
      navigate('/')
      setSearchInput("")
      setLogoDriving(false) // reset the bike back to its resting position
    }, 550)
  }

  return (
    <nav className="sticky top-0 z-50 h-20 border-b border-slate-200/70 bg-[#f7f9fb]/80 px-5 shadow-sm backdrop-blur-xl sm:px-8 lg:px-16">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-3">

      {/* Logo */}
      <span
        onClick={handleLogoClick}
        className="group flex cursor-pointer shrink-0 flex-col items-center leading-none"
      >
        <svg
          viewBox="0 0 64 34"
          className={`logo-bike h-5 w-10 text-[#005ab4] transition-transform duration-500 ease-out group-hover:translate-x-1.5 sm:h-6 sm:w-12 ${logoDriving ? 'driving' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* frame */}
          <path d="M18 24 L28 12 L40 12 L34 24 M28 12 L24 6 L30 6 M40 12 L46 18 L52 18" />
          {/* rear wheel */}
          <g className="wheel">
            <circle cx="12" cy="24" r="8" />
            <path d="M12 16v16M4 24h16M6.3 18.3l11.4 11.4M6.3 29.7l11.4-11.4" strokeWidth="1.2" />
          </g>
          {/* front wheel */}
          <g className="wheel">
            <circle cx="48" cy="24" r="8" />
            <path d="M48 16v16M40 24h16M42.3 18.3l11.4 11.4M42.3 29.7l11.4-11.4" strokeWidth="1.2" />
          </g>
        </svg>
        <span className="font-display text-2xl font-bold tracking-tight text-[#005ab4]">
          MotoShop
        </span>
      </span>

      <div className="hidden items-center gap-7 text-sm md:flex">
        <button onClick={() => navigate('/')} className="border-b-2 border-[#005ab4] py-2 font-semibold text-[#005ab4]">Showroom</button>
        {/* <button className="text-slate-600 transition hover:text-[#005ab4]">Collections</button>
        <button className="text-slate-600 transition hover:text-[#005ab4]">Pre-Owned</button>
        <button className="text-slate-600 transition hover:text-[#005ab4]">Finance</button> */}
      </div>

      {/* Search bar — Amazon style, takes up center space */}
      {!isLoginPage && (
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md lg:max-w-xl xl:max-w-2xl mx-4 lg:mx-10 ">
        <div className="relative w-full">
          <input
            type="text"
            value={searchInput}
            onChange={(e)=>handleSearchChange(e)}
            placeholder="Search vehicles by name or brand..."
            className="h-10 w-full rounded-full border-0 bg-slate-200/70 pl-5 pr-10 text-sm text-slate-900 placeholder-slate-500 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ab4]/20"
          />
          {
            suggestions.length > 0 && (
              <div className="absolute left-0 top-full right-0 border border-slate-200
               bg-white rounded-2xl shodaw-lg mt-2 overflow-hidden z-50">
                {suggestions.map(product=> (
                  <div key={product.id}
                  className='px-5 py-3 hover:bg-blue-50 transition cursor-pointer'
                  onClick={()=>{navigate(`/products/${product.id}`);
                           setsuggestions([]);
                            setSearchInput(product.name); } 
                  }
                  >
                    <div className='font-medium'>
                      {product.name}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {product.company}
                    </div>

                </div>
                ))
                  
                }
                

              </div>
            )
          }
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="hidden"

          // bg-orange-500 hover:bg-orange-600 text-white px-3 h-11 lg:h-12 pl-4 pr-4  rounded-full shrink-0 flex items-center justify-center transition cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
      </form>
      )}
      

      {/* Right — Account + Cart */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0">
        {localStorage.getItem("userToken") && (
          <NotificationBell role="user" />
        )}
        
         {name && (
          <button
            onClick={() => navigate("/wishlist")}
            className="relative flex items-center  gap-1 sm:gap-1.5 sm:px-3 px-2 py-1.5 text-sm text-black-400 border border-slate-200 rounded-md hover:border-blue-500 hover:text-blue transition cursor-pointer bg-white justify-center "
          >
            <span>♥</span>
            <span className="hidden lg:inline">Wishlist</span>
          </button>
        )}
        <div className="relative">
          {name ? (
            <div onClick={() => setIsAccountOpen(!isAccountOpen)}>
              <button className="hidden sm:flex items-center h-10 lg:h-11 px-2 lg:px-2   hover:border-blue-400 transition">
                <span className="text-[10px] flex flex-row sm:text-xs  text-slate-500 truncate">
                  Hi {name}
                </span><MdAccountCircle className="text-3xl" />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 top-14 mt-0 w-31 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => { setIsAccountOpen(false); navigate("/profile") }}
                    className="w-full text-left px-5 py-3.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Profile
                  </button>
                  <button
                    className="w-full px-5 text-left py-3.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    onClick={() => { setIsAccountOpen(false); navigate('/my-orders') }}
                  >
                    Your orders
                  </button>
                  <button
                    className="w-full px-5 text-left py-3.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    onClick={() => {
                      localStorage.removeItem("userToken")
                      localStorage.removeItem("userName")
                      localStorage.removeItem("userEmail")
                      setIsAccountOpen(false)
                      navigate("/login")
                      window.location.reload()
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate(isLoginPage ? '/register' : '/login')}
              className="flex h-10 items-center justify-center rounded-full border border-slate-200 px-4 font-medium hover:border-[#005ab4] hover:text-[#005ab4] transition"
            >
              {isLoginPage ? "Register" : "Login"}
            </button>
          )}
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-200 cursor-pointer shrink-0"
        >
          

<MdShoppingCart className="text-2xl" />
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-6 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-semibold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
      </div>
    </nav>
  )
}
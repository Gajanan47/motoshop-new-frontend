import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { fetchMe } from '../api/users'
import {MapPinned} from 'lucide-react'
const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState("")
  const [loading, setLoading] = useState(true)
  const name = localStorage.getItem('userName')
  useEffect(() => {
    async function loader() {
      try {
        const res = await fetchMe()
        setUser(res.data.data)
      } catch (err) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    loader()
  }, [navigate])

  function handleLogOut() {
    localStorage.removeItem("userToken")
    localStorage.removeItem("userName")
    navigate('/login')
  }

  // if(loading) {
  //   return (
  //     <>
  //     <div className="min-h-screen flex bg-white items-center justify-center">
  //       <p className="text-slate-600">Loading your account...</p>
  //     </div>

  //     </>
  //   )
  // }

  const card = [
    {
      title: "Your Orders",
      desc: "Track orders, return and buy again",
      icon: "📦",
      onClick: () => navigate('/my-orders'),
    },
    {
      title: "Login & Security",
      desc: "Edit your name, email and password",
      icon: "🔒",
      onClick: () => navigate('/account/reauth'),
    },
    {
      title: "Your Address",
      desc: "Edit your address or add addresses",
      icon: <MapPinned/>,
      onClick: () => navigate('/account/addresses'),
    },
    {
      title: "Contact Us",
      desc: "Get help with an order or account issue",
      icon: "💬",
      onClick: () => alert("Coming Soon...."),
    },
  ]

  return (
    <main className=' w-full max-w-container-max mx-auto px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-gutter relative'>
      <aside className='lg:col-span-3 space-y-2 sticky top-32 hidden md:block  '>
        <h2 className=" font-[Hanken Grotesk] text-[Hanken Grotesk] text-center text-[#434655] px-4 mb-6 tracking-widest uppercase">Account Settings</h2>
        {card.map((c) => (
          <nav className="flex flex-col" key={c.title} >
            <button className='flex items-center px-4 py-3 border rounded-lg border-primary border-l-4 text-primary transition-all duration-200 ' onClick={c.onClick}>
              <span className="text-2xl materials-symbols-outlined">{c.icon}</span>
              <span>{c.title}</span>
            </button>
          </nav>
        ))}
      </aside>

      <div className="lg:col-span-9 space-y-10">

        {/* Header */}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-8">

          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, {name}
            </h1>

            <p className="text-gray-500 mt-3">
              Manage your automotive profile, secure your account and track your
              acquisitions.
            </p>
          </div>

          <div className="mt-5 md:mt-0 flex items-center gap-3 rounded-full border border-gray-200 bg-gradient-to-r from-blue-100 to-blue-50/5 px-5 py-3 shadow-sm">

            <span className="text-2xl">🏆</span>

            <span className="font-semibold">
              MotoShop Platinum
            </span>

          </div>

        </div>



        {/* Dashboard Cards */}

        <div className="grid grid-cols-2 gap-6">

          {card.map((item) => (

            <button
              key={item.title}
              onClick={item.onClick}
              className="group rounded-2xl border border-gray-200 bg-white p-8 text-left shadow-sm transition-all  duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500"
            >

              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-3xl sm:text-xl transition group-hover:bg-blue-50">

                {item.icon}

              </div>

              <h2 className="mt-6 text-2xl sm:text-md font-bold text-gray-900">
                {item.title}
              </h2>

              <p className="mt-2 xs:text-xs text-gray-500">
                {item.desc}
              </p>

              <div className="mt-6 flex items-center gap-2 text-blue-600 font-semibold">

                Continue

                <span className="group-hover:translate-x-1 transition">
                  →
                </span>

              </div>

            </button>

          ))}

        </div>



        {/* Premium Banner */}

        <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-10 py-10 mt-10">

          <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-blue-600 opacity-20 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">

            <div>

              <h2 className="text-3xl font-bold text-white">
                Elevate Your Experience
              </h2>

              <p className="mt-3 max-w-xl text-gray-300">
                Unlock exclusive showroom events, priority test drives and dedicated
                concierge services by upgrading to our premium membership.
              </p>

            </div>

            <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

              View Benefits

            </button>

          </div>

        </div>

      </div>

        {/* <Footer/> */}
    </main>



















    // <div className = "min-h-screen bg-white ">
    //   <div className="max-w-4xl px-8 py-10 mx-auto">
    //     <h2 className="text-2xl font-medium text-slate-900 mb-6">
    //       Your Account
    //     </h2>

    //     <div className="grid grid-cols-2 gap-8 py-5">
    //       {card.map((c) => (
    //       <div key={c.title} 
    //       onClick={c.onClick}
    //        className="bg-white rounded-2xl shadow-sm p-5 border border-transparent hover:border-blue-400 hover:-translate-y-0.5 transition cursor-pointer">
    //         <span className='text-2xl'>{c.icon}</span>
    //         <h5 className="text-base font-medium text-slate-900">{c.title}</h5>
    //         <span className="text-sm text-slate-600">{c.desc}</span>
    //       </div>))}


    //     </div>
    //   </div>
    //   <Footer/>
    // </div>
  )
}

export default Profile
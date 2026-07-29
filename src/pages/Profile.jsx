import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loader(){
      try{
        const res = await fetchMe()
        setUser(res.data.data)
    }catch (err) {
      navigate('/login')
    }finally{
      setLoading(false)
    }
    loader()
    }
  }, [navigate])

  function handleLogOut(){
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
    title:"Your Orders",
    desc:"Track orders, return and buy again",
    icon:"📦",
    onClick:()=>navigate('/my-orders'),
  },
    {
    title:"Login & Security",
    desc:"Edit your name, email and password",
    icon:"🔒",
    onClick:()=> navigate('/account/reauth'),
  },
    {
    title:"Your Address",
    desc:"Edit your address or add addresses",
    icon:"🔒",
    onClick:()=>navigate('/account/addresses'),
  },
    {
    title:"Contact Us",
    desc:"Get help with an order or account issue",
    icon:"💬",
    onClick:()=>alert("Coming Soon...."),
  },
]
    
  return (
    <div className = "min-h-screen bg-white ">
      <div className="max-w-4xl px-8 py-10 mx-auto">
        <h2 className="text-2xl font-medium text-slate-900 mb-6">
          Your Account
        </h2>

        <div className="grid grid-cols-2 gap-8 py-5">
          {card.map((c) => (
          <div key={c.title} 
          onClick={c.onClick}
           className="bg-white rounded-2xl shadow-sm p-5 border border-transparent hover:border-orange-400 hover:-translate-y-0.5 transition cursor-pointer">

            <h5 className="text-base font-medium text-slate-900">{c.title}</h5>
            <span className="text-sm text-slate-600">{c.desc}</span>
          </div>))}
          

        </div>
      </div>
    </div>
  )
}

export default Profile
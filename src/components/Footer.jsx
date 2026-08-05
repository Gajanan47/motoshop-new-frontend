import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, AtSign } from "lucide-react"
const Footer = () => {
    const navigate = useNavigate()
    return (
        <footer className='bg-white border-grey-200 border-t'>
            <div className="max-w-7xl py-12 px-8 mx-auto">
                <div className="flex flex-wrap justify-between gap-0">

                    {/* left side */}
                    <div className="max-w-xs">
                        <h2 onClick={() => document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" })}
 className='text-blue-600 text-xl mb-4 font-bold'>
                            MotoShop
                        </h2>

                        <p className='text-gray-700 leading-7'>
                            Your destination for high-performance automotive acquisition
                            and engineering excellence.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-xs tracking-[3px] uppercase text-gray-700 mb-4">
                            Company
                        </h3>
                        <ul className='space-y-3 text-gray-700'>
                            <li>
                                <a href='#'>
                                    About Us
                                </a>
                            </li>

                            <li>
                                <a href='#'>
                                    Terms of Service
                                </a>
                            </li>

                        </ul>

                    </div>

                    <div>
                        <h3 className='font-semibold text-xs tracking-[3px] uppercase text-gray-700 mb-4'>
                            Support
                        </h3>
                        <ul className='space-y-3 text-gray-700'>
                            <a href='#'>
                                Privacy Policy
                            </a>
                            <a href='#'>
                                Contact Support
                            </a>
                        </ul>

                    </div>

                    <div>
                        <h3 className='font-semibold text-xs tracking-[3px] uppercase text-gray-700 mb-4'>
                            Network
                        </h3>
                        <ul className='space-y-3 text-gray-700'>
                            <li>
                                Dealership Locater
                            </li>
                        </ul>

                    </div>
                    <div className='flex flex-col justify-between items-end'>
                        <div className="flex gap-4">
                            <button className='border rounded-full w-11 h-11 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition'>
                                <Globe size={18} />
                            </button>
                            <button className='border rounded-full w-11 h-11 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition'>
                                <AtSign size={18} />
                            </button>
                        </div>
                        {/* <div>
                            <p>2026 MotoShop Automotive Group. All rights reserved.</p>
                        </div> */}
                    </div>

                </div>
            </div>

        </footer>
    )
}

export default Footer
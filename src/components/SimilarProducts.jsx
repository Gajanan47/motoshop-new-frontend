import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SimilarProducts = ({products}) => {
    const navigate = useNavigate()
    if(!products.length )return null
    const handleClick = (productId) => {
        navigate(`/products/${productId}`)
        window.scrollTo({top:0,behavior: 'smooth'})
    }
  return (
  <div className='mt-16 px-4 sm:px-8'>
  <h2 className='font-bold text-xl sm:text-2xl mb-6'>You May Also Like</h2>

  <div className='flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 scrollbar-none'>
    {products.map(product => (
      <div
        className='cursor-pointer shadow-black/20 border border-solid border-black  relative rounded-xl hover:shadow-blue-600 hover:shadow-inner transition overflow-hidden bg-slate-150 shrink-0 w-[160px] sm:w-[200px] md:w-[250px] snap-start'
        key={product.id}
        onClick={() => handleClick(product.id)}
      >
        <img src={product.image} className='h-32 sm:h-44 md:h-52 w-full object-contain p-4' />
        <div className='p-3 sm:p-4'>
          <p className='text-xs text-gray-500 uppercase truncate'>
            {product.company}
          </p>
          <h3 className='font-semibold mt-1 text-sm sm:text-base line-clamp-2'>{product.name}</h3>
          <div className='flex flex-wrap items-center gap-2 mt-2'>
            <span className='bg-green-600 text-white text-xs px-2 py-1 rounded'>
              {product.rating}
            </span>
            <span className='text-xs sm:text-sm text-gray-400'>
              ({product.reviews})
            </span>
          </div>
          <p className='text-blue-600 font-bold text-base sm:text-lg mt-2'>
            ₹{Number(product.price).toLocaleString()}L
          </p>
        </div>
      </div>
    ))}
  </div>
</div>)
}

export default SimilarProducts
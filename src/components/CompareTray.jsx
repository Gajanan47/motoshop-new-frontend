import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'

const CompareTray = () => {
    const { compareList, isInCompare, toggleCompare, removeFromCompare, clearCompare, MAX_COMPARE } = useCompare()
    const navigate = useNavigate()
    if (compareList.length === 0)
        return null;

    return (
        <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-3 flex items-center gap-4 w-[min(92vw,480px)] bg-white border border-b'>
            <div className='flex gap-2 items-center flex-1'>
                {
                    compareList.map((product) => (
                        <div key={product.id} className='relative shrink-0'>
                            <img src={product.image} alt={product.name} className='w-12 h-12 object-contain bg-slate-50 rounded-md border border-slate-200' />
                            <button onClick={() => removeFromCompare(product.id)} className='absolute -top-1.5 w-4 h-4 rounded-full bg-slate-700 text-white text-[10px] items-center justify-center   cursor-pointer  '>
                                ×
                            </button>
                        </div>))
                }
                {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                    <div key={'empty-${i}'} className='h-12 w-12 shrink-0 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs '>
                        +
                    </div>

                ))}
                <span className='text-xs text-slate-500 ml-1 hidden sm:block'>
                    {compareList.length} / {MAX_COMPARE} selected
                </span>
            </div>
            <button onClick={clearCompare} className='text-xs text-slate-500 hover:text-red-400 cursor-pointer shrink-0 border border-slate-200 px-4 py-2 '>
                Clear
            </button>
            <button onClick={() => navigate('/compare')} className='bg-blue-400 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-medium px-4 py-2 transition cursor-pointer border border-slate-200'>
                Compare
            </button>

        </div>

    )
}

export default CompareTray
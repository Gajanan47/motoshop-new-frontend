import { useContext, useState, createContext } from 'react'

const CompareContext = createContext()

export function CompareProvider({children}){
    const [compareList, setCompareList] = useState([])
    const MAX_COMPARE = 2;
    
    const isInCompare =(id)=> compareList.some((p)=> p.id === id)

    const toggleCompare = (product) => {
        setCompareList((prev) =>{
            const exists = prev.some((p) => p.id === product.id)
            if(exists){
                return prev.filter((p) => p.id !== product.id)
            }
            if(prev.length > MAX_COMPARE){
                return [prev[1], product]
            }
            return [...prev, product]
        })

    }
    const removeFromCompare = (id) => setCompareList((prev)=>prev.filter((p)=>p.id !== id))

    const clearCompare = () => setCompareList([])

    return(
        <CompareContext.Provider value = {
            {compareList, isInCompare, toggleCompare, removeFromCompare, clearCompare, MAX_COMPARE}
        }>
            {children}
            </CompareContext.Provider>

    )
}

export function useCompare (){ return useContext(CompareContext)}
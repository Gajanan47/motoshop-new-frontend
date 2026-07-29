import {useState, useEffect,createContext, useContext, useCallback} from 'react'
import { addWishlist, removeWishlist, getWishlist } from '../api/wishlist'

const WishlistContext = createContext()
export function WishlistProvider ({children}) {
    const [wishlistIds, setwishlistIds] = useState(new Set());
    const [wishlistProducts, setwishlistProducts] = useState([])
    const [loading, setloading] = useState(false)

    const refreshWishlist = useCallback(async ()=>{
        if(!localStorage.getItem("UserToken")){
            setwishlistIds(new Set())
            setwishlistProducts([])
            return ;
        }
        setloading(true)
        try{
            const res = await getWishlist()
            products = res.data.data
            setwishlistProducts([])
            setwishlistIds(new Set(products.map((p) => p.id)))

        }
        catch(err){
            console.error(err.message)
        }finally{
            setloading(false)
        }
    }, [])

    useEffect(()=>{
        refreshWishlist()
    }, [refreshWishlist])

    const toggleWishlist = async (product) => {
    const wasWishlisted = wishlistIds.has(product.id)

  // update local state immediately so every card reflects it right away
    setwishlistIds((prev) => {
    const next = new Set(prev)
    wasWishlisted ? next.delete(product.id) : next.add(product.id)
    return next
  })
    setwishlistProducts((prev) =>
    wasWishlisted ? prev.filter((p) => p.id !== product.id) : [...prev, product]
  )

  try {
    if (wasWishlisted) {
      await removeWishlist(product.id)
    } else {
      await addWishlist(product.id)
    }
  } catch (err) {
    console.error(err)
    // request failed — undo the optimistic update by resyncing with the server
    refreshWishlist()
  }
}
return (
  <WishlistContext.Provider
    value={{ wishlistIds, wishlistProducts, loading, toggleWishlist, refreshWishlist }}
  >
    {children}
  </WishlistContext.Provider>
) }
export const useWishlist = () => useContext(WishlistContext)

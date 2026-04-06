import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); return }
    try {
      setLoading(true)
      const { data } = await api.get('/cart')
      setCart(data)
    } catch { setCart(null) }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = async (productId, quantity = 1, size = null) => {
    const { data } = await api.post('/cart/add', { productId, quantity, size })
    setCart(data)
    return data
  }

  const updateItem = async (itemId, quantity) => {
    const { data } = await api.put(`/cart/item/${itemId}`, { quantity })
    setCart(data)
  }

  const removeItem = async (itemId) => {
    const { data } = await api.delete(`/cart/item/${itemId}`)
    setCart(data)
  }

  const clearCart = async () => {
    await api.delete('/cart/clear')
    setCart(prev => prev ? { ...prev, items: [] } : prev)
  }

  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0
  const subtotal = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateItem, removeItem, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

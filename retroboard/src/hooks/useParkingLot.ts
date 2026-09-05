import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { ParkingLotItem } from '@/types/database'

export function useParkingLot(sessionId: string | undefined) {
  const [items, setItems] = useState<ParkingLotItem[]>([])
  const user = useAuthStore((s) => s.user)

  const fetchItems = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('parking_lot_items')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('fetchItems failed:', error)
      return
    }
    if (data) setItems(data)
  }, [sessionId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (!sessionId) return
    const channel = supabase
      .channel(`parking-lot-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_lot_items', filter: `session_id=eq.${sessionId}` },
        () => fetchItems()
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') console.error('parking lot channel error:', err)
      })
    return () => { supabase.removeChannel(channel) }
    // fetchItems catturato in closure - NON in deps (infinite loop prevention)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const addItem = async (text: string) => {
    if (!user || !sessionId) return
    const { error } = await supabase.from('parking_lot_items').insert({
      session_id: sessionId,
      user_id: user.id,
      text,
    })
    if (error) console.error('addItem failed:', error)
    else await fetchItems()
  }

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase.from('parking_lot_items').delete().eq('id', itemId)
    if (error) console.error('deleteItem failed:', error)
    else await fetchItems()
  }

  const convertToAction = async (itemId: string, actionId: string) => {
    // Mark item as converted and link to action
    const { error } = await supabase
      .from('parking_lot_items')
      .update({ is_converted: true, action_id: actionId })
      .eq('id', itemId)
    if (error) console.error('convertToAction failed:', error)
    else await fetchItems()
  }

  return { items, addItem, deleteItem, convertToAction, fetchItems }
}

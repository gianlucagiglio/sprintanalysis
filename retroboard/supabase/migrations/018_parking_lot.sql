-- Migration 018: Parking Lot
-- Aggiunge tabella parking_lot_items per parcheggiare temi fuori scope

-- Drop existing table if exists (idempotency)
DROP TABLE IF EXISTS parking_lot_items CASCADE;

-- Create parking_lot_items table
CREATE TABLE parking_lot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  text TEXT NOT NULL,
  is_converted BOOLEAN DEFAULT false,
  action_id UUID REFERENCES actions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE parking_lot_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "parking_lot_select" ON parking_lot_items;
DROP POLICY IF EXISTS "parking_lot_insert" ON parking_lot_items;
DROP POLICY IF EXISTS "parking_lot_update" ON parking_lot_items;
DROP POLICY IF EXISTS "parking_lot_delete" ON parking_lot_items;

-- RLS: partecipanti sessione possono vedere
CREATE POLICY "parking_lot_select" ON parking_lot_items
  FOR SELECT TO authenticated
  USING (session_id IN (
    SELECT session_id FROM session_participants WHERE user_id = auth.uid()
  ));

-- RLS: utenti autenticati possono inserire propri item
CREATE POLICY "parking_lot_insert" ON parking_lot_items
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS: autore può modificare
CREATE POLICY "parking_lot_update" ON parking_lot_items
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS: autore può eliminare
CREATE POLICY "parking_lot_delete" ON parking_lot_items
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE parking_lot_items;

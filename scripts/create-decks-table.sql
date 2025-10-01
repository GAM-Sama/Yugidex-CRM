-- Tabla para almacenar los decks de Yu-Gi-Oh!
CREATE TABLE decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  main_deck JSONB DEFAULT '[]'::jsonb,
  extra_deck JSONB DEFAULT '[]'::jsonb,
  side_deck JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_decks_name ON decks(name);
CREATE INDEX idx_decks_created_at ON decks(created_at);

-- RLS (Row Level Security) para que los usuarios solo vean sus propios decks
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propios decks
CREATE POLICY "Users can view own decks" ON decks
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar sus propios decks
CREATE POLICY "Users can insert own decks" ON decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propios decks
CREATE POLICY "Users can update own decks" ON decks
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propios decks
CREATE POLICY "Users can delete own decks" ON decks
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

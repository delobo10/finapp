-- Tabela de previsão de receita mensal
CREATE TABLE income_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  month TEXT NOT NULL, -- formato: YYYY-MM
  amount DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Habilitar RLS
ALTER TABLE income_forecasts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own forecasts"
  ON income_forecasts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forecasts"
  ON income_forecasts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forecasts"
  ON income_forecasts FOR UPDATE
  USING (auth.uid() = user_id);

-- Gatilho para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_income_forecasts_updated_at
    BEFORE UPDATE ON income_forecasts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de orçamentos mensais por categoria
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  month TEXT NOT NULL, -- formato: YYYY-MM
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para melhor performance
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);

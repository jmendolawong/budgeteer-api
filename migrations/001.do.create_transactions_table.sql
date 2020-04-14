CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  date TIMESTAMP default now() NOT NULL,
  cost DECIMAL(12,2) NOT NULL,
  payee TEXT,
  memo TEXT
);
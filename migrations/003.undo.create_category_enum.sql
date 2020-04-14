ALTER TABLE transactions
DROP COLUMN IF EXISTS category;

DROP TYPE IF EXISTS expense_category;
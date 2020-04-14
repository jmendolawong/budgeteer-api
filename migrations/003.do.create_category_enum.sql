CREATE TYPE expense_category AS ENUM (
  'Shopping',
  'Groceries',
  'Gym',
  'Auto & Transport',
  'Restaurants',
  'Personal Care',
  'Travel',
  'Home',
  'Entertainment',
  'Bills & Utilities'
);

ALTER TABLE transactions
ADD COLUMN category expense_category NOT NULL;

TRUNCATE transactions;

INSERT INTO transactions (id, category, date, cost, payee, memo) VALUES
  (
    '016ff008-a15d-4a03-b489-09903bf28562', 'Groceries', '4/6/2020', 50, 
    'Kroger', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.'
  ),
  ( '77d0f3d4-7ac8-45bb-81d1-49d0679942ca', 'Gym', '3/26/2020', 25,
    'YMCA', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.'
  ),
  (
   '5aa52679-1636-4b33-adc8-b27b7ca56fa8', 'Shopping', '3/3/2020', 75,
   'Walmart', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.'
  ),
  (
    'd7c932ee-3474-482a-8f0e-49b64a67dd02', 'Restaurants', '4/3/2020', 34,
    'Outback', NULL
  ),
   (
    '2bf4cc8e-5670-4f44-b7dc-32a8bda159ac', 'Groceries', '4/16/2020', 23.25, 
    'Kroger', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.'
  ),
   (
    '9bd65ab1-5777-41fa-a76b-45ac2ad12c10', 'Bills & Utilities', '4/01/2020', 71.50, 
    'AT&T', NULL
  ),
   (
    '30428739-525f-4a8b-a515-d03eca491596', 'Restaurants', '3/29/2020', 43.99, 
    'Red Lobster', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.'
  );
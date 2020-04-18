TRUNCATE users, transactions;

INSERT INTO users(id, userName, password) VALUES
  (
    '10954ec2-1f78-4ccd-8335-26de3edbb7b1', 'testUser', '$2a$12$iUC/xdOc3vF.HaODIl0/weX37t61W/J85Df1diWV3KUiHfDyQrFPW'
  ),
  (
    ':accountId', 'tester', '$2a$12$R.WMeCLVMY14J/cL3XqJ3OdkTA2n3XgvGRRyWGUloo8DvrGPusZ0q'
  );



INSERT INTO transactions (id, category, date, cost, payee, memo, account) VALUES
  (
    '016ff008-a15d-4a03-b489-09903bf28562', 'Groceries', '04/6/2020', 50, 
    'Kroger', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.',
    '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
  ),
  ( '77d0f3d4-7ac8-45bb-81d1-49d0679942ca', 'Gym', '03/26/2020', 25,
    'YMCA', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.',
    '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
  ),
  (
   '5aa52679-1636-4b33-adc8-b27b7ca56fa8', 'Shopping', '03/3/2020', 75,
   'Walmart', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.',
    '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
  ),
  (
    'd7c932ee-3474-482a-8f0e-49b64a67dd02', 'Restaurants', '04/3/2020', 34,
    'Outback', NULL, '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
  ),
   (
    '2bf4cc8e-5670-4f44-b7dc-32a8bda159ac', 'Groceries', '04/16/2020', 23.25, 
    'Kroger', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.',
    '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
  ),
   (
    '9bd65ab1-5777-41fa-a76b-45ac2ad12c10', 'Bills & Utilities', '04/01/2020', 71.50, 
    'AT&T', NULL, '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
  ),
   (
    '30428739-525f-4a8b-a515-d03eca491596', 'Restaurants', '03/29/2020', 43.99, 
    'Red Lobster', 'Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.',
    '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
  );
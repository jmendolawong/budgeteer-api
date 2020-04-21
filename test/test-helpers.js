const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeTransactionsArray() {
  return [
    {
      "id": "2bf4cc8e-5670-4f44-b7dc-32a8bda159ac",
      "category": "Groceries",
      "date": "04/16/2020",
      "cost": "23.25",
      "payee": "Kroger",
      "memo": "Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.",
      "account": "10954ec2-1f78-4ccd-8335-26de3edbb7b1"
    },
    {
      "id": "016ff008-a15d-4a03-b489-09903bf28562",
      "category": "Groceries",
      "date": "04/06/2020",
      "cost": "50.00",
      "payee": "Kroger",
      "memo": "Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.",
      "account": "10954ec2-1f78-4ccd-8335-26de3edbb7b1"
    },
    {
      "id": "d7c932ee-3474-482a-8f0e-49b64a67dd02",
      "category": "Restaurants",
      "date": "04/03/2020",
      "cost": "34.00",
      "payee": "Outback",
      "memo": "",
      "account": "10954ec2-1f78-4ccd-8335-26de3edbb7b1"
    },
    {
      "id": "9bd65ab1-5777-41fa-a76b-45ac2ad12c10",
      "category": "Bills & Utilities",
      "date": "04/01/2020",
      "cost": "71.50",
      "payee": "AT&T",
      "memo": "",
      "account": "10954ec2-1f78-4ccd-8335-26de3edbb7b1"
    },
    {
      "id": "30428739-525f-4a8b-a515-d03eca491596",
      "category": "Restaurants",
      "date": "03/29/2020",
      "cost": "43.99",
      "payee": "Red Lobster",
      "memo": "Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.",
      "account": "10954ec2-1f78-4ccd-8335-26de3edbb7b1"
    },
    {
      "id": "77d0f3d4-7ac8-45bb-81d1-49d0679942ca",
      "category": "Gym",
      "date": "03/26/2020",
      "cost": "25.00",
      "payee": "YMCA",
      "memo": "Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.",
      "account": "10954ec2-1f78-4ccd-8335-26de3edbb7b1"
    },
    {
      "id": "5aa52679-1636-4b33-adc8-b27b7ca56fa8",
      "category": "Shopping",
      "date": "03/03/2020",
      "cost": "75.00",
      "payee": "Walmart",
      "memo": "Praesent sagittis a mi sit amet dictum. Donec orci nibh, dignissim in leo et, congue semper mauris.",
      "account": "10954ec2-1f78-4ccd-8335-26de3edbb7b1"
    }
  ]
}

function makeUsersArray() {
  return [
    {
      "id": "10954ec2-1f78-4ccd-8335-26de3edbb7b1",
      "username": "testUser",
      "password": "password"
    },
    {
      "id": "850319cc-6c89-40d4-91ac-e5ed33c8ae4e",
      "username": "tester",
      "password": "password1"
    }
  ]
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',

  })

  return `Bearer ${token}`
}


function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
}

function cleanTables(db) {
  return db.raw('TRUNCATE transactions, users')
}

module.exports = {
  makeTransactionsArray,
  makeUsersArray,
  makeAuthHeader,
  seedUsers,
  cleanTables,
}
const { expect } = require('chai');
const knex = require('knex')
const app = require('../src/app.js')
const { makeTransactionsArray, makeUsersArray, makeAuthHeader, seedUsers } = require('./transactions.fixtures')

describe('Transactions endpoints', function () {
  let db

  const testUsers = makeUsersArray();
  const testTransactions = makeTransactionsArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('Clean table', () =>
    db.raw('TRUNCATE transactions, users')
  )

  afterEach('Clean table', () =>
    db.raw('TRUNCATE transactions, users')
  )

  beforeEach('Seed tables', () => {
    return db
      .insert(testTransactions)
      .into('transactions'),
      seedUsers(db, testUsers)
  })


  /************  Protected Endpoints ************/
  describe(`************  Protected Endpoints ************`, () => {

    const protectedEndpoints = [
      {
        name: 'GET /api/:accountId',
        path: '/api/:accountId'
      },
      {
        name: 'GET /api/:accountId/transactions/:transactionId',
        path: '/api/:accountId/transactions/5aa52679-1636-4b33-adc8-b27b7ca56fa8'
      },
    ]

    protectedEndpoints.forEach(endpoint => {

      describe(endpoint.name, () => {
        it(`responds with 401 'Missing basic token' when no basic token`, () => {
          return supertest(app)
            .get(endpoint.path)
            .expect(401, { error: `Missing basic token` })
        })

        it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
          const userNoCreds = { username: '', password: '' }
          return supertest(app)
            .get(endpoint.path)
            .set('Authorization', makeAuthHeader(userNoCreds))
            .expect(401, { error: `Unauthorized request` })
        })

        it(`responds 401 'Unauthorized request' when invalid user`, () => {
          const userInvalidCreds = { username: 'user-not', password: 'existy' }
          return supertest(app)
            .get(endpoint.path)
            .set('Authorization', makeAuthHeader(userInvalidCreds))
            .expect(401, { error: `Unauthorized request` })
        })

        it(`responds 401 'Unauthorized request' when invalid password`, () => {
          const userInvalidPass = { username: testUsers[0].username, password: 'wrong' }
          return supertest(app)
            .get(endpoint.path)
            .set('Authorization', makeAuthHeader(userInvalidPass))
            .expect(401, { error: `Unauthorized request` })
        })

      })

    })

  })


  /************  GET Endpoints ************/
  describe('************  GET Endpoints ************', () => {
    describe('GET /api/:accountId', () => {

      context('Given no transactions in the db', () => {

        it('responds 200 and empty list', () => {
          return supertest(app)
            .get('/api/:accountId')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200, [])
        })
      })

      context('Given transactions in the db', () => {

        beforeEach('Seed table', () => {
          seedUsers(db, testUsers)
          return db
            .insert(testTransactions)
            .into('transactions')
        })

        it('responds 200 and all transactions', () => {
          return supertest(app)
            .get('/api/:accountId')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200, testTransactions)
        })
      })

    })


    describe('GET /api/:accountId/transactions/:transactionId', () => {
      context('No transaction with that id', () => {
        it('responds 404', () => {
          const id = 1234
          return supertest(app)
            .get(`/api/:accountId/transactions/${id}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(404, { error: { message: `Expense doesn't exist` } })
        })
      })

      context('Given transactions in the database', () => {

        beforeEach('Seed table', () => {
          seedUsers(db, testUsers)
          return db
            .insert(testTransactions)
            .into('transactions')
        })

        it('responds 200 and article with id', () => {
          const transactionId = 2
          const expectedTransaction = testTransactions[transactionId]
          return supertest(app)
            .get(`/api/:accountId/transactions/d7c932ee-3474-482a-8f0e-49b64a67dd02`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200, expectedTransaction)
        })
      })
    })
  })

  /************  POST Endpoints ************/
  describe('************  POST Endpoints ************', () => {
    describe('POST /api/:accountId', () => {
      it('responds 201 and inserts new transaction', () => {
        const newTransaction = {
          category: 'Shopping',
          date: '01/01/2020',
          cost: '1.50',
          payee: 'test payee',
          memo: 'test memo'
        }

        return supertest(app)
          .post('/api/10954ec2-1f78-4ccd-8335-26de3edbb7b1')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(newTransaction)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.category).to.eql(newTransaction.category)
            expect(res.body.date).to.eql(newTransaction.date)
            expect(res.body.cost).to.eql(newTransaction.cost)
            expect(res.body.payee).to.eql(newTransaction.payee)
            expect(res.body.memo).to.eql(newTransaction.memo)
            expect(res.headers.location).to.eql(`/api/10954ec2-1f78-4ccd-8335-26de3edbb7b1/transactions/${res.body.id}`)
          })
          .then(postRes =>
            supertest(app)
              .get(`/api/10954ec2-1f78-4ccd-8335-26de3edbb7b1/transactions/${postRes.body.id}`)
              .set('Authorization', makeAuthHeader(testUsers[0]))
              .expect(postRes.body)
          )
      })

      const requiredFields = ['category', 'date', 'cost']

      requiredFields.forEach(field => {
        const newTransaction = {
          category: 'Groceries',
          date: '01/01/2020',
          cost: '1.50'
        }

        it('responds 400 and error message with missing required field', () => {
          delete newTransaction[field]

          return supertest(app)
            .post('/api/:accountId')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .send(newTransaction)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            })
        })
      })
    })
  })

  /************  DELETE Endpoints ************/
  describe('************  DELETE Endpoints ************', () => {
    describe('DELETE /:accountId/transactions/:transactionId', () => {
      context('No transaction with that id', () => {
        it('responds 404', () => {
          const id = 1234
          return supertest(app)
            .delete(`/api/:accountId/transactions/${id}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(404, { error: { message: `Expense doesn't exist` } })
        })
      })

      context('Given transactions', () => {

        beforeEach('Seed table', () => {
          return db
            .insert(testTransactions)
            .into('transactions')
        })


        it('responds 204 and the remaining articles', () => {
          const id = 'd7c932ee-3474-482a-8f0e-49b64a67dd02'
          const remainingTransactions = testTransactions.filter(transaction => transaction.id !== id)
          return supertest(app)
            .delete(`/api/:accountId/transactions/${id}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(204)
            .then(res => {
              supertest(app)
                .get(`/api/:accountId`)
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .expect(remainingTransactions)
            })
        })
      })
    })
  })

})
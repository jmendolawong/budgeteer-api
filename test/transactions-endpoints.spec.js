const { expect } = require('chai');
const knex = require('knex')
const app = require('../src/app.js')
const { makeTransactionsArray } = require('./transactions.fixtures')

describe('Transactions endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('Clean table', () =>
    db.raw('TRUNCATE transactions')
  )

  afterEach('Clean table', () =>
    db.raw('TRUNCATE transactions')
  )

  /************  GET Endpoints ************/

  describe('GET /api/:accountId/transactions', () => {

    context('Given no transactions in the db', () => {
      it('responds 200 and empty list', () => {
        return supertest(app)
          .get('/api/:accountId/transactions')
          .expect(200, [])
      })
    })

    context('Given transactions in the db', () => {
      const testTransactions = makeTransactionsArray()

      beforeEach('Seed table', () => {
        return db
          .insert(testTransactions)
          .into('transactions')
      })

      it('responds 200 and all transactions', () => {
        return supertest(app)
          .get('/api/:accountId/transactions')
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
          .expect(404, { error: { message: `Expense doesn't exist` } })
      })
    })

    context('Given transactions in the database', () => {
      const testTransactions = makeTransactionsArray()

      beforeEach('Seed table', () => {
        return db
          .insert(testTransactions)
          .into('transactions')
      })

      /**********************8 */
      it('responds 200 and article with id', () => {
        const transactionId = 2
        const expectedTransaction = testTransactions[transactionId]
        return supertest(app)
          .get(`/api/:accountId/transactions/d7c932ee-3474-482a-8f0e-49b64a67dd02`)
          .expect(200, expectedTransaction)
      })
    })
  })

  /************  POST Endpoints ************/
  describe('POST /api/:accountId/transactions', () => {
    it('responds 201 and inserts new transaction', () => {
      const newTransaction = {
        "category": "Groceries",
        "date": "01/01/2020",
        "cost": "2.50",
        "payee": "test payee",
        "memo": "test memo"
      }

      return supertest(app)
        .post('/api/7a3b2c59-7689-498d-acbb-e6d0ec17e2c3/transactions')
        .send(newTransaction)
        .expect(201)
        .expect(res => {
          console.log(res.body)
          expect(res.body).to.have.property('id')
          expect(res.body.category).to.eql(newTransaction.category)
          expect(res.body.date).to.eql(newTransaction.date)
          expect(res.body.cost).to.eql(newTransaction.cost)
          expect(res.body.payee).to.eql(newTransaction.payee)
          expect(res.body.memo).to.eql(newTransaction.memo)
          expect(res.headers.location).to.eql(`/api/7a3b2c59-7689-498d-acbb-e6d0ec17e2c3/transactions/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/7a3b2c59-7689-498d-acbb-e6d0ec17e2c3/transactions/${postRes.body.id}`)
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
          .post('/api/:accountId/transactions')
          .send(newTransaction)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })
  })

  /************  DELETE Endpoints ************/

  describe('DELETE /:accountId/transactions/:transactionId', () => {
    context('No transaction with that id', () => {
      it('responds 404', () => {
        const id = 1234
        return supertest(app)
          .delete(`/api/:accountId/transactions/${id}`)
          .expect(404, { error: { message: `Expense doesn't exist` } })
      })
    })

    context('Given transactions', () => {
      const testTransactions = makeTransactionsArray()

      beforeEach('Seed table', () => {
        return db
          .insert(testTransactions)
          .into('transactions')
      })

      it('responds 204 and the remaining articles', () => {
        const id = '2bf4cc8e-5670-4f44-b7dc-32a8bda159ac'
        const remainingTransactions = testTransactions.filter(transaction => transaction.id !== id)
        return supertest(app)
          .delete(`/api/:accountId/transactions/${id}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/:accountId/transactions`)
              .expect(remainingTransactions)
          })
      })
    })
  })


})
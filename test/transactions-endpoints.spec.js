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

  describe.only('GET /api/:accountId/transactions', () => {

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


})
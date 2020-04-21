const { expect } = require('chai');
const knex = require('knex')
const app = require('../src/app.js')
const helpers = require('./test-helpers')

describe('Transactions endpoints', function () {
  let db

  const testUsers = helpers.makeUsersArray();
  const testTransactions = helpers.makeTransactionsArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('Clean table', () => helpers.cleanTables(db))

  afterEach('Clean table', () => helpers.cleanTables(db))

  beforeEach('Seed tables', () => {
    return db
      .insert(testTransactions)
      .into('transactions'),
      helpers.seedUsers(db, testUsers)
  })


  /************  GET Endpoints ************/
  describe('************  GET Endpoints ************', () => {
    describe('GET /api/:accountId', () => {
      context('Given no transactions in the db', () => {
        it('responds 200 and empty list', () => {
          const accountId = '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
          return supertest(app)
            .get(`/api/${accountId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, [])
        })
      })

      context('Given transactions in the db', () => {

        beforeEach('Seed table', () => {
          helpers.seedUsers(db, testUsers)
          return db
            .insert(testTransactions)
            .into('transactions')
        })

        it('responds 200 and all transactions', () => {
          const accountId = '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
          return supertest(app)
            .get(`/api/${accountId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, testTransactions)
        })
      })

    })


    describe('GET /api/:accountId/transactions/:transactionId', () => {
      context('No transaction with that id', () => {
        it('responds 404', () => {
          const accountId = '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
          const id = 1234
          return supertest(app)
            .get(`/api/${accountId}/transactions/${id}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(404, { error: { message: `Expense doesn't exist` } })
        })
      })

      context('Given transactions in the database', () => {

        beforeEach('Seed table', () => {
          helpers.seedUsers(db, testUsers)
          return db
            .insert(testTransactions)
            .into('transactions')
        })

        it('responds 200 and article with id', () => {
          const accountId = '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
          const transactionId = 2
          const expectedTransaction = testTransactions[transactionId]
          return supertest(app)
            .get(`/api/${accountId}/transactions/d7c932ee-3474-482a-8f0e-49b64a67dd02`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(postRes.body)
          )
      })

      const requiredFields = ['category', 'date', 'cost']

      requiredFields.forEach(field => {
        const accountId = '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
        const newTransaction = {
          category: 'Groceries',
          date: '01/01/2020',
          cost: '1.50'
        }

        it('responds 400 and error message with missing required field', () => {
          delete newTransaction[field]

          return supertest(app)
            .post(`/api/${accountId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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
          const accountId = '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
          const id = 1234
          return supertest(app)
            .delete(`/api/${accountId}/transactions/${id}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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
          const accountId = '10954ec2-1f78-4ccd-8335-26de3edbb7b1'
          const id = 'd7c932ee-3474-482a-8f0e-49b64a67dd02'
          const remainingTransactions = testTransactions.filter(transaction => transaction.id !== id)
          return supertest(app)
            .delete(`/api/${accountId}/transactions/${id}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(204)
            .then(res => {
              supertest(app)
                .get(`/api/${accountId}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(remainingTransactions)
            })
        })
      })
    })
  })

})
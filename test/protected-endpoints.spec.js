const { expect } = require('chai');
const knex = require('knex')
const app = require('../src/app.js')
const helpers = require('./test-helpers')

describe('************  Protected Endpoints ************', function () {
  let db

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0]
  const testTransactions = helpers.makeTransactionsArray();

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
      helpers.seedUsers(db, testUsers)
  })


  /************  Protected Endpoints ************/
  describe('Protected Endpoints', () => {

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
        it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
          return supertest(app)
            .get(endpoint.path)
            .expect(401, { error: `Missing bearer token` })
        })

        it(`responds 401 'Unauthorized request' when invalid JWT`, () => {
          const validUser = testUser
          const invalidSecret = 'bad-secret'
          return supertest(app)
            .get(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
            .expect(401, { error: `Unauthorized request` })
        })

        it(`responds 401 'Unauthorized request' when sub in payload`, () => {
          const invalidUser = { username: 'user-not', id: ':accountId' }
          return supertest(app)
            .get(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: `Unauthorized request` })
        })
      })

    })

  })

})
const { expect } = require('chai');
const knex = require('knex')
const app = require('../src/app.js')
const helpers = require('./test-helpers')

describe.only('Auth endpoints', function () {
  let db

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0]
  //const testTransactions = helpers.makeTransactionsArray();

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


  /******************  Auth Endpoints ******************/
  describe.only(`POST /api/authentication`, () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers,
      )
    )

    const requiredFields = ['username', 'password']

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        username: testUser.username,
        password: testUser.password,
      }

      it(`responds with 401 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field]

        return supertest(app)
          .post('/api/authentication')
          .send(loginAttemptBody)
          .expect(401, {
            error: `Missing '${field}' in request body`,
          })
      })
    })

    it(`responds 401 'invalid username or password' when bad user_name`, () => {
      const invalidUser = { username: testUser.username, password: 'existy' }
      return supertest(app)
        .post('/api/authentication')
        .send(invalidUser)
        .expect(401, { error: `Incorrect user_name or password` })
    })

    it(`responds 401 'invalid username or password' when bad password`, () => {
      const userInvalidUser = { username: testUser.username, password: 'existy' }
      return supertest(app)
        .post('/api/authentication')
        .send(userInvalidUser)
        .expect(401, { error: `Incorrect user_name or password` })
    })

  })
})
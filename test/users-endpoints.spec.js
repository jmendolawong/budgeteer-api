const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('************  Users Endpoints ************', function () {
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

  before('Clean table', () => helpers.cleanTables(db))

  afterEach('Clean table', () => helpers.cleanTables(db))

  beforeEach('insert users', () =>
    helpers.seedUsers(db, testUsers)
  )

  describe(`POST /api/users`, () => {
    context(`User Validation`, () => {
      const requiredFields = ['username', 'password']

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: 'test user_name',
          password: 'test password',
        }

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            })
        })
      })
    })
  })
})
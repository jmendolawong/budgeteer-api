const knex = require('knex')
const app = require('../src/app')
const bcrypt = require('bcryptjs')

const helpers = require('./test-helpers')

describe('************  Users Endpoints ************', function () {
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
    context(`************ User Validation ************`, () => {
      const requiredFields = ['username', 'password']

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: 'test user_name',
          password: 'test password',
        }

        it(`responds with 401 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/api/users')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(registerAttemptBody)
            .expect(401, {
              error: `Missing '${field}' in request body`,
            })
        })
      })

      it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
        const userShortPassword = {
          username: 'test user_name',
          password: '1234567',
        }
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(userShortPassword)
          .expect(400, { error: `Password must be longer than 8 characters` })
      })

      it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
        const userLongPassword = {
          username: 'test user_name',
          password: '*'.repeat(73),
        }
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(userLongPassword)
          .expect(400, { error: `Password must be less than 72 characters` })
      })

      it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          username: 'test user_name',
          password: ' 1Aa!2Bb@',
        }
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(userPasswordStartsSpaces)
          .expect(400, { error: `Password must not start or end with empty spaces` })
      })

      it(`responds 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
          username: 'test user_name',
          password: '1Aa!2Bb@ ',
        }
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(userPasswordEndsSpaces)
          .expect(400, { error: `Password must not start or end with empty spaces` })
      })

      it(`responds 400 error when password isn't complex enough`, () => {
        const userPasswordNotComplex = {
          username: 'test user_name',
          password: '11AAaabb',
        }
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(userPasswordNotComplex)
          .expect(400, { error: `Password must contain 1 upper case, lower case, number and special character` })
      })

      it(`responds 400 'User name already taken' when user_name isn't unique`, () => {
        const duplicateUser = {
          username: testUser.username,
          password: '11AAaa!!',
        }
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(duplicateUser)
          .expect(400, { error: `Username already taken` })
      })
    })

    context('************ Happy path ************', () => {
      it('responds 201, serializes new user, bcrypts password and inserts into user database', () => {
        const newUser = {
          username: 'happyPathUser',
          password: 'AAbb!!22'
        }
        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.username).to.eql(newUser.username)
            expect(res.body).to.not.have.property('password')
          })
          .expect(res =>
            db
              .from('users')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username)
                return bcrypt.compare(newUser.password, row.password)
              })
              .then(matchingPasswords => {
                expect(matchingPasswords).to.be.true
              })
          )
      })
    })
  })
})
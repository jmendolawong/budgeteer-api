process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'budgeteer-secret-key-4/19'


const { expect } = require('chai')
const supertest = require('supertest')

global.expect = expect;
global.supertest = supertest;

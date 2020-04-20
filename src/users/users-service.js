const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const UsersService = {

  getUser(db, username) {
    return db
      .select('*')
      .from('users')
      .where({ username })
      .first()
  },

  parseBasictoken(token) {
    return Buffer
      .from(token, 'base64')
      .toString()
      .split(':')
  },

  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash)
  },

  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      algorithm: 'HS256',
    })
  },

  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'],
    })
  },


}

module.exports = UsersService
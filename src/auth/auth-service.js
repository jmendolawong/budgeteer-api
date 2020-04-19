const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const AuthService = {

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


}

module.exports = AuthService
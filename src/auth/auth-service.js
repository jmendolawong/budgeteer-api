const bcrypt = require('bcryptjs')

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


}

module.exports = AuthService
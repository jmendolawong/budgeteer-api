const express = require('express');
//const xss = require('xss');
//const path = require('path');
//const uuid = require('uuid/v4');
//const moment = require('moment')
const AuthService = require('./auth-service');
//const { requireAuth } = require('../middleware/basic-auth')

const authRouter = express.Router()
const bodyParser = express.json()


/*********** Post Endpoint ***********/
authRouter
  .post('/', bodyParser, (req, res, next) => {
    const { username, password } = req.body
    const login = { username, password }

    for (const [key, value] of Object.entries(login))
      if (value == null)
        return res.status(401).json({
          error: `Missing '${key}' in request body`
        })

    AuthService.getUser(
      req.app.get('db'),
      login.username
    )
      .then(dbUser => {
        if (!dbUser)
          return res.status(401).json({
            error: `Incorrect user_name or password`
          })

        return AuthService.comparePasswords(login.password, dbUser.password)
          .then(passwordsMatch => {
            if (!passwordsMatch)
              return res.status(401).json({
                error: `Incorrect user_name or password`
              })

            const sub = dbUser.username
            const payload = { user_id: dbUser.id }
            res.send({
              authToken: AuthService.createJwt(sub, payload),
            })
          })
      })
      .catch(next)
  })

module.exports = authRouter;
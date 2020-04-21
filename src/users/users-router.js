const express = require('express');
const path = require('path');
const uuid = require('uuid/v4')
const UsersService = require('./users-service');

const usersRouter = express.Router()
const bodyParser = express.json()


/*********** Post Endpoint ***********/
usersRouter
  .post('/', bodyParser, (req, res, next) => {
    const { username, password } = req.body
    const login = { username, password }

    for (const [key, value] of Object.entries(login))
      if (value == null)
        return res.status(401).json({
          error: `Missing '${key}' in request body`
        })

    const passwordError = UsersService.validatePassword(password)
    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.getUser(
      req.app.get('db'),
      login.username
    )
      .then(dbUser => {
        if (dbUser)
          return res.status(400).json({
            error: `Username already taken`
          })


        UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              id: uuid(),
              username,
              password: hashedPassword,
            }

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.sanitizeUser(user))
              })
          })
      })
      .catch(next)
  })

module.exports = usersRouter;
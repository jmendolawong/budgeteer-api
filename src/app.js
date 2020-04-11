require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config.js')

const app = express();

const bodyParser = express.json()
const xss = require('xss')

/***********  Middleware ***********/
app.use(helmet())
app.use(cors())
const morganSetting = NODE_ENV === 'production' ? 'tiny' : 'dev';
app.use(morgan(morganSetting))



/***********  Endpoints ***********/
const expenses = require('./expenses.js');

app.get('/expenses', (req, res) => {
  res.json(expenses)
})

app.post(bodyParser, (req, res) => {
  const { category, date, cost, payee='', memo='' } = req.body;
  const newExpense = { category, date, cost }

  res
    .status(201)
    .location(path.posix.join(req.originalUrl, '/'))
})





/***********  Error handling ***********/
app.use((error, req, res, next) => {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error('error');
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app
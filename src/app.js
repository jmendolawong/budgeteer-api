require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config.js')

const expenseRouter = require('./expenses/expense-router')

const app = express();


/***********  Middleware ***********/
app.use(helmet())
app.use(
  cors(/*{
    origin: CLIENT_ORIGIN
  }*/)
);
const morganSetting = NODE_ENV === 'production' ? 'tiny' : 'dev';
app.use(morgan(morganSetting))



/***********  Endpoints ***********/
app.use('/api', expenseRouter)


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
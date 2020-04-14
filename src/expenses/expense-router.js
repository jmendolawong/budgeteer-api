const express = require('express');
const xss = require('xss');
const path = require('path');
const uuid = require('uuid/v4');
const ExpenseService = require('./expense-service');

const expenseRouter = express.Router()
const bodyParser = express.json()

/***********  Sanitation ***********/
const sanitizeExpense = expense => ({
  id: expense.id,
  category: xss(expense.category),
  date: xss(expense.date),
  cost: xss(expense.cost),
  payee: xss(expense.payee),
  memo: xss(expense.memo)
})



/***********  Endpoints ***********/

expenseRouter
  /*
  GET all transactions
  PATCH transaction
  DELETE transaction
  */
  .route('/:accountId/transactions')
  .get((req, res, next) => {
    ExpenseService.getAllExpenses(
      req.app.get('db')
      //,      req.params.accountId
    )
      .then(expenses => {
        res.json(expenses.map(sanitizeExpense))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    const { category, date, cost, payee = '', memo = '' } = req.body;
    const newExpense = { category, date, cost }


    //request body validation
    for (const [key, value] of Object.entries(newExpense))
      if (value == null) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        })
      }

    // Get uuid for newExpense id 
    const id = uuid();
    newExpense.id = id

    //add optional fields
    newExpense.payee = payee;
    newExpense.memo = memo;

    ExpenseService.addExpense(
      req.app.get('db'),
      newExpense
      //,      req.params.accountId
    )
      .then(expense => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${newExpense.id}`))
          .json(sanitizeExpense(expense))
      })
      .catch(next)
  })

expenseRouter
  .route('/:accountId/transaction/:transactionId')
  .delete((req, res, next) => {
    //const account = req.params.accountId;
    const id = req.params.transactionId;

    ExpenseService.deleteExpense(
      req.app.get('db'),
      id
      //, account
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

/*
 
 
  res
    .status(201)
    .location(path.posix.join(req.originalUrl, '/'))
})
 
//POST transaction
.route('/:accountId/add-transaction')

//POST category
.route('/:accountId/add-category')
*/

module.exports = expenseRouter;
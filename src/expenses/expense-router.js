const express = require('express');
const xss = require('xss');
const path = require('path');
const uuid = require('uuid/v4');
const moment = require('moment')
const ExpenseService = require('./expense-service');
const { requireAuth } = require('../middleware/jwt-auth')

const expenseRouter = express.Router()
const bodyParser = express.json()

/***********  Sanitation ***********/
const sanitizeExpense = expense => ({
  id: expense.id,
  category: xss(expense.category),
  date: xss(moment(expense.date).format("MM/DD/YYYY")),
  cost: xss(parseFloat(expense.cost).toFixed(2)),
  payee: xss(expense.payee),
  memo: xss(expense.memo),
  account: xss(expense.account)
})


/*********** Transactions Endpoints ***********/
expenseRouter
  .route('/:accountId')
  .all(requireAuth)
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
  .post(requireAuth, bodyParser, (req, res, next) => {
    const { category, date, cost, payee = '', memo = '' } = req.body;
    const newExpense = { category, date, cost }

    //request body validation
    for (const [key, value] of Object.entries(newExpense))
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
      }

    // Get uuid for newExpense id 
    const id = uuid();
    const account = req.params.accountId
    newExpense.account = account;
    newExpense.id = id

    //add optional fields
    newExpense.payee = payee;
    newExpense.memo = memo;

    ExpenseService.addExpense(
      req.app.get('db'),
      newExpense
    )
      .then(expense => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/transactions/${newExpense.id}`))
          .json(sanitizeExpense(expense))
      })
      .catch(next)
  })

expenseRouter
  .route('/:accountId/transactions/:transactionId')
  .all(requireAuth)
  .all((req, res, next) => {
    ExpenseService.getExpenseById(
      req.app.get('db'),
      req.params.transactionId
    )
      .then(expense => {
        if (!expense) {
          return res.status(404).json({
            error: { message: `Expense doesn't exist` }
          })
        }
        res.expense = expense
        next();
      })
      .catch(next)
  })
  .get((req, res, next) => {
    return res.json(sanitizeExpense(res.expense))
  })
  .delete((req, res, next) => {
    //const account = req.params.accountId;
    ExpenseService.deleteExpense(
      req.app.get('db'),
      req.params.transactionId
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
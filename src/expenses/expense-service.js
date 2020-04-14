const ExpenseService = {
  getAllExpenses(db) {
    return db
      .select('*')
      .from('transactions')
  },

  addExpense(db, newExpense) {
    return db
      .insert(newExpense)
      .into('transactions')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  deleteExpense(db, id) {
    return db
      .delete()
      .from('transactions')
      .where({ id })
  },

  updateExpense(db, id, newExpenseData) {
    return db
      .update(expenseData)
      .from('transactions')
      .where({ id })
  }
}

module.exports = ExpenseService
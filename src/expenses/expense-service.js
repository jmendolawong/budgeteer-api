const ExpenseService = {

  getAllExpenses(db, account) {
    return db
      .select('*')
      .from('transactions')
      .where({ account })
      .orderBy('date', 'desc')
  },

  getExpenseById(db, account, id) {
    return db
      .select('*')
      .from('transactions')
      .where({ id })
      .andWhere({ account })
      .first()
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

  deleteExpense(db, account, id) {
    return db
      .delete()
      .from('transactions')
      .where({ id })
      .andWhere ({account})
  },

}

module.exports = ExpenseService
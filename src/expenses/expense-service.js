const ExpenseService = {
  getAllExpenses(db) {
    return db
      .select('*')
      .from('transactions')
      //.where(knex.raw(`to_char(date, 'MM/DD/YYYY')`))
      .orderBy('date', 'desc')
  },

  getExpenseById(db, id) {
    return db
      .select('*')
      .from('transactions')
      .where({ id })
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

  deleteExpense(db, id) {
    return db
      .delete()
      .from('transactions')
      .where({ id })
  },

  updateExpense(db, id, newExpenseData) {
    return db
      .update(newExpenseData)
      .from('transactions')
      .where({ id })
  }
}

module.exports = ExpenseService
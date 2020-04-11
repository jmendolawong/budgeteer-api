const app = require('./app');
//const knex = require('knex');
const { PORT } = require('./config.js')

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})

module.exports = { app }
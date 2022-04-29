const postgres = require('postgres')
require('dotenv').config()

const databaseConnection = postgres({
   host: process.env.PGHOST,
   port: process.env.PGPORT,
   database: process.env.PGDATABASE,
   username: process.env.PGUSER,
   password: process.env.PGPASSWORD,

})

module.exports = databaseConnection


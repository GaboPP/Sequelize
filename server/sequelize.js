
const Sequelize = require('sequelize');
const sequelize = new Sequelize('test', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

// Or you can simply use a connection uri
//const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');


module.exports = sequelize;
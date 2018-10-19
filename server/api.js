const express = require('express');
const router = express.Router();
const sequelize = require('./sequelize');

sequelize.authenticate().then(() => {
    console.log('La conección ha sido exitosa.');
  }).catch(err => {
    console.error('No se a podido conetar a la base de datos: ', err);
  });

const users = sequelize.import('users', require("../models/users"));
const compras = sequelize.import('compras', require("../models/compras"));

router.get('/', (req, res) =>{
    res.send('api works');
});

users.findAll().then(users => {
    //console.log(users);
});
//SELECT * FROM users
compras.findAll().then(compras => {
    //console.log(compras);
});
//SELECT * FROM compras
compras.findAll({
    attributes: ['detalle']
  }).then(compras =>{
      for (i=0;i<compras.length;i++){
        //console.log("detalle compra: %s",compras[i].dataValues.detalle);
      }
  });
//SELECT detalle FROM compras

compras.findAll({
    attributes: [[sequelize.fn('COUNT', sequelize.col('id_compra')), 'ides']]
}).then(largo =>{
        //console.log("largo: %s",largo[0].dataValues.ides);
});
//SELECT COUNT(id_compra) AS ides

users.findAll({
    where: {
      id: 2,
      Nombre: 'cote'
    }
}).then(users =>{
    //console.log("users: %o",users[0].dataValues);
});
//SELECT * FROM users WHERE id = 2 AND Nombre = cote

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
users.findAll({
    where: {
        id: {
            [Op.or]: [1,2]
        }
    }
  }).then(users =>{
    console.log("users: %o\nusers: %o",users[0].dataValues,users[1].dataValues);
});
//SELECT * FROM users WHERE id = 2 OR id = 1



compras.destroy({
    where: {
      id_compra: 5
    }
  });
// DELETE FROM users WHERE id = 5;
  
users.update({
    Nombre: 'Juan',
  }, {
    where: {
      id: 3
    }
  });
// UPDATE users SET Nombre = juan WHERE id=3;

compras.create({
    id_compra: 5,
    detalle: "cocodrilo",
    valor: 150000,
    id_usuario: 5
});
// INSERT INTO "compras" ("id_compra","detalle","valor","id_usuario") VALUES (5,'cocodrilo',150000,5); 


module.exports = router;
const sequelize = require('../server/sequelize');
const users = sequelize.import('users', require("../models/users"));
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('compras', {
        id_compra: {
            type: DataTypes.BIGINT,
            primaryKey: true // si no se declara sequelize lo hace por defecto
        },
        detalle: {
            type: DataTypes.STRING,
        },
        valor: {
            type: DataTypes.NUMERIC,
        },
        id_usuario: {
            type: DataTypes.STRING,
            references: {
                // This is a reference to another model
                model: users,

                // This is the column name of the referenced model
                key: 'id',
            }
        }
        }, {
        tableName: 'compras', //si la entidad esta en plural sequelize anota el nombre por defecto
        timestamps: false, //por que no declaramos "CrateAt" ni tiempos de creación en nuestro modelo, si no ... exacto, sequelize lo hac epor defecto.
        }
    );
}

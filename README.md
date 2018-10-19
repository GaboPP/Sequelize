#SEQUELIZE
Aprendiendo sequelize

## Hint y Antes de empezar
* Sequelize aplica tecnicas de active record pero no por completo, este es un Componente ORM y ORM **NO ES UN PATRÓN**.
* en la consola de comando escribe **ng new sequel --routing** (no podemos ponerle sequelize a nuestro proyecto por que luego hará confilictos con el 'npm')
* luego como en PeliSans crear una carpeta server pero esta vez solo con el archivo **server/api.js**, este es su código:
~~~
    const express = require('express');
    const router = express.Router();

    router.get('/', (req, res) =>{
        res.send('api works');
    });

    module.exports = router;
~~~
* y en nuestra carpeta proyecto "SEQUEL" crear un archivo **server.js**, donde montamos nuestro servidor:
~~~
    /* Librerias */
    const express = require('express');
    const path = require('path');
    const http = require('http');
    const bodyParser = require('body-parser');

    /* Incluimos la Api*/
    const api = require('./server/api');

    /*Crear App de Express*/
    const app = express();

    /* Parser para POST */
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    /* Static Path */
    app.use(express.static(path.join(__dirname, 'dist/PeliSans')));

    /* Ruta para nuestra API */
    app.use('/api/v1', api);

    /* Todas las rutas no dirigidas a la API se las enviamos a angular */
    app.get('*', (req, res) =>{
        res.sendFile(path.join(__dirname, 'dist/PeliSans/index.html'));
    });

    /* Setear el puerto donde se escucharán las peticiones */
    const port = process.env.PORT || '3000';
    app.set('port', port);

    /* Levantamos el servidor */
    const server = http.createServer(app);
    server.listen(port,()=> console.log(`API corriendo en el puerto:${port}`));
~~~
* instalamos las dependencias:
~~~
    npm install --save sequelize
    npm install --save pg pg-hstore
~~~

# Creando BD
crearemos una base de datos llamda test, ahí crearemos dos tablas:
- users:
    * id pk
    * Nombre
    * Apellido
    * Password

y también compras:
- compras:
    * id compra pk
    * detalle
    * valor
    * id usuario fk
e ingresamos unos datos
# Conectando Sequelize 

Ahora conectaremos sequelize a postgres, para esto debemos crear un archivo de javascript en la carpeta **server**, lo llamaremos **sequelize.js** y contendrá lo suguiente:
~~~
    const Sequelize = require('sequelize');
    const sequelize = new Sequelize('test', 'postgres', '', {
    host: 'localhost',
    dialect: 'postgres',
    operatorsAliases: false,
    });

    module.exports = sequelize;
~~~

Para comprobrar la conección, debemos importar en **server/api.js** nuestro archivo y hacer una autenticación, para esto agregamos las siguientes lineas:

~~~
    const sequelize = require('./sequelize');

    sequelize.authenticate().then(() => {
        console.log('La conección ha sido exitosa.');
    })
    .catch(err => {
        console.error('No se a podido conetar a la base de datos: ', err);
    });
~~~

ahora si ejecutamos el comando **node server** podremos ver que se realizó con éxito la conección

# Generando modelos

Para lograr hacer las consultas en la base de datos, hay que generar los objetos que representarán nuestras tablas, para esto creamos una carpeta models y dentro de ella, creamos users.js con el siguiente código:
~~~
    module.exports = function(sequelize, DataTypes) {
        return sequelize.define('users', {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true, // si no se declara sequelize lo hace por defecto
                autoIncrement: true
            },
            Nombre: {
                type: DataTypes.STRING,
            },
            Apellido: {
                type: DataTypes.STRING
            }
            }, {
            tableName: 'users', //si la entidad esta en plural sequelize anota el nombre por defecto
            timestamps: false, //por que no declaramos "CrateAt" ni tiempos de creación en nuestro modelo, si no ... exacto, sequelize lo hac epor defecto.
            }
        );
    };
~~~
y para **compras.js**:
~~~
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
~~~
# Consultando modelo

Ahora para lograr hacer nuestras consultas debemos importar nuestro modelo en **server/api.js** y agregar antes de module.exports lo siguente:


~~~
const users = sequelize.import('users', require("../models/users"));

users.findAll().then(users => {
    console.log(users);
});

compras.findAll().then(compras => {
    console.log(compras);
});
~~~
Con findAll haremos algo así como un **SELECT * From users||compras** y rescataremos todos los datos de usuarios o compras segun sea el caso

# Otros tipos de SELECT
* Ahora veremos como consultar por columna:
~~~
compras.findAll({
    attributes: ['detalle']
  }).then(compras =>{
      for (i=0;i<compras.length;i++){
        //console.log("detalle compra: %s",compras[i].dataValues.detalle);
      }
  });
//SELECT detalle FROM compras
~~~
* Y como hacer un COUNT:
~~~
compras.findAll({
    attributes: [[sequelize.fn('COUNT', sequelize.col('id_compra')), 'ides']]
}).then(largo =>{
        //console.log("largo: %s",largo[0].dataValues.ides);
});
//SELECT COUNT(id_compra) AS ides
~~~

# WHERE
* Para hacer un where este se exolicita y dentro se declaran los parametros (si se declara mas de una condición, sequelize las tomará como un AND, osea se deben cumplir todas)
~~~
users.findAll({
    where: {
      id: 2,
      Nombre: 'cote'
    }
}).then(users =>{
    //console.log("users: %o",users[0].dataValues);
});
//SELECT * FROM users WHERE id = 2 AND Nombre = cote
~~~
Ahora bien, si bien queremos hacer un OR debemos llamar a las operaciones especiales de sequelize:
~~~
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
~~~
**Recomendación: NO utilizar los caracteres especiales '$or'**
#DELETE
Para eliminar se necesita el siguiente código, como usamos foráneas, debemos cuidar de eliminar primero en compras y luego en usuario, si es que quisieramos eliminar un usuario:
~~~
compras.destroy({
    where: {
      id_compra: 5
    }
  });
// DELETE FROM users WHERE id = 5;
~~~
#UPDATE
Luego si queremos hacer un update, hacemos lo siguiente
~~~
users.update({
    Nombre: 'Juan',
  }, {
    where: {
      id: 3
    }
  });
  // UPDATE users SET Nombre = juan WHERE id=3;
~~~
#INSERT
Para hacer una nueva inserción en una tabla se sigue la siguiente estructura:
~~~
compras.create({
    id_compra: 5,
    detalle: "cocodrilo",
    valor: 150000,
    id_usuario: 5
});
// INSERT INTO "compras" ("id_compra","detalle","valor","id_usuario") VALUES (5,'cocodrilo',150000,5); 

~~~


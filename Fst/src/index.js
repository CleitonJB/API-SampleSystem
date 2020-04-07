//chamando o express
const express = require('express');
//chamando o body parser
const bodyParser = require('body-parser');

//criando a aplicação
const app = express();

//fazendo com que as requisições solicitadas em formato JSON sejam entendidas pela API
app.use(bodyParser.json());
//fazendo com que os paramentros passados pela url sejam compreendidos pela API
app.use(bodyParser.urlencoded({ extended: false }));

//referenciando os métodos CRUD
require('./app/controllers/index')(app);

//Informando em qual porta a API seja executada e poderá ser acessada
app.listen(3000);
//chamando o mongoose 
const mongoose = require('mongoose');

//definindo o ponto de conexão com o banco de dados.'noderest' é o nome do banco de dados em questão
mongoose.connect('mongodb://localhost:27017/noderest', { useMongoClient: true });

//indicar a classe de promisse que o mongoose vai utilizar 
mongoose.Promise = global.Promise;

module.exports = mongoose;
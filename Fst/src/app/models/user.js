//importando a conexão com o bando de dados criado em database/index.js
const mongoose = require('../../database/index');
//importando biblioteca para criptografar a senha
const bcrypt = require('bcryptjs');

//Definindo o modelo padrão de usuário
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true,
        select: false   //Quando um usuário for buscado no bando de dados a senha não virá junto
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date, 
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//criptografar a senha do usuário antes de salvá-lo
UserSchema.pre('save', async function(next) {
    /*
    10 é a quantidade de vezes em que a senha será alterada (criptografada). 'Número de rounds', na programação
    */
    const hash = await bcrypt.hash(this.password, 10); 

    this.password = hash;

    next();
});

//Definindo User como um modelo (User = mongoose.model) e informando qual é sua classe (UserSchema)
const User = mongoose.model('User', UserSchema);
//exportando a classe User
module.exports = User;
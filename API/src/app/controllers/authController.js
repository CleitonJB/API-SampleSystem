const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth'); //contém o 'segredo' para criar os tokens

const autorizacao = require('../middlewares/auth');

const User = require('../models/user');

const router = express.Router();

//função que gera o token
function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,         
    });
}

//Cadastro
router.post('/register', async (req, res) =>{
    const { email } = req.body;

    try {
        if(await User.findOne({ email })){
            return res.status(400).send({ erro: 'Este email já está sendo usado' });
        }

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({ 
            user,
            token: generateToken({ id: user.id }),
        });

    } catch (error) {
        return res.status(400).send({ erro: 'Erro ao tentar cadastrar usuário' });
    }
});

//Login
router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if(!user){
        return res.status(400).send({ erro: 'Usuário não encontrado' });
    }

    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ error: 'Senha incorreta' });
    }

    user.password = undefined;

   res.send({ 
       user, 
       token: generateToken({ id: user.id }),
    });
});

//Todos usuários
router.route('/users').get(autorizacao, async (req, res, next) => {
    User.find((error, response) => {
        if(error){
            return next(error);
        }else{
            return res.status(200).send({ response });
        }
    });
});

//Único usuário
router.route('/user/:id').get(autorizacao, async (req, res, next) => {
    User.findById(req.params.id, (error, data) => {
        if(error){
            return next(error);
        }else{
            return res.status(200).json({ msg: data });
        }
    })
});

module.exports = app => app.use('/auth', router);
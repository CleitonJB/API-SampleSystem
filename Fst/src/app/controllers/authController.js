//chamando o express, pois ele possuí os métodos para as requisições http
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const authConfig = require('../../config/auth');

//chamando o usuário
const User = require('../models/user');

//definindo uma variável que recebe o método de rotas (Router) do express
const router = express.Router();

function generateToken(params = []) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

router.post('/register', async (req, res) => {
    //apenas pegando o email para a verificação. Se o usuário já existe ou não
    const { email } = req.body;

    //tentar criar um novo usuário com as informações passadas
    try {
        //verificando se usuário já existe pelo email
        if(await User.findOne({ email })){
            return res.status(400).send({ error: 'Este email já está sendo usado!' });
        }

        //criando usuário com os dados fornecidos
        const user = await User.create(req.body);

        //remover a senha do objeto retornado para o usuário
        user.password = undefined;

        //retornando o usuário criado. SEM A SENHA
        return res.send({ 
            user,
            token: generateToken({ id: user.id}),
        });
    }catch (err) {
        return res.status(400).send({ error: 'Erro ao registrar novo usuário' });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user){
        return res.status(400).send({ error: 'Usuário não encontrado' });
    }

    if (!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ error: 'Senha incorreta' });
    }

    user.password = undefined;

    res.send({ 
        user, 
        token: generateToken({ id: user.id}),
    });
});     

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try{
        const user = await User.findOne({ email });

        if(!user){
            res.status(400).send({ error: 'Usuário não encontrado' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        mailer.sendMail({
            to: email,
            from: 'cleitonbraga56@gmail.com',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            if(err){
                return res.status(400).send({ error: 'O email para alterar sua senha não pode ser enviado, tente novamente!' });
            }
            
            return res.send({ token, ok: 'Email enviado com sucesso'});
        });

    }catch (err) {
        console.log(err);
        res.status(400).send({ error: 'Erro ao tentar recuperar senha, tente novamente!' });
    }
});

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;

    try {

        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        if(!user){
            return res.status(400).send({ error: 'Usuário não encontrado' });
        }

        if(token !== user.passwordResetToken){
            return res.status(401).send({ error: 'Token inválido' });
        }

        const now = new Date();

        if(now > user.passwordResetExpires){
            return res.status(400).send({ error: 'Token expirado. Faça uma nova requisição para alterar a sua senha' });
        }

        user.password = password;

        await user.save();

        res.send(); //Só para a requisição receber status 200k
        
    } catch (error) {
        res.status(400).send({ error: 'Erro ao alterar senha, tente novamente!' });
    }
});

/*
Estou definindo um 'prefixo' de rotas de autentificação. Todas as rotas criadas neste documento terão o 'prefixo' de '/auth'. Por exemplo: /auth/register 
e não /register.
*/
module.exports = app => app.use('/auth', router);
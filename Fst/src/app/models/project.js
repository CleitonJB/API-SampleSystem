//importando a conexão com o bando de dados criado em database/index.js
const mongoose = require('../../database/index');

//Definindo o modelo padrão de usuário
const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//Definindo Project como um modelo (Project = mongoose.model) e informando qual é sua classe (ProjectSchema)
const Project = mongoose.model('Project', ProjectSchema);
//exportando a classe Project
module.exports = Project;
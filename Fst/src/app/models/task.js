//importando a conexão com o bando de dados criado em database/index.js
const mongoose = require('../../database/index');

//Definindo o modelo padrão de usuário
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        require: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    completed: {
        type: Boolean,
        require: true,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//Definindo Task como um modelo (Task = mongoose.model) e informando qual é sua classe (TaskSchema)
const Task = mongoose.model('Task', TaskSchema);
//exportando a classe Task
module.exports = Task;
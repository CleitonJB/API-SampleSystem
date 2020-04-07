const express = require('express');
const authMiddleware = require('../middlewares/auth');

const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        //Além de mostrar todos os projetos cadastrados, mostra todas as informações do usuário que o criou '.populate('user')' 
        const projects = await Project.find().populate(['user', 'tasks']);

        return res.status(200).send({ projects });

    } catch (error) {
        res.status(400).send({ error: 'Erro ao carregar os projetos' });
    }
});

router.get('/:projectId', async (req, res) => {
    try {
        //Além de mostrar todos os projetos cadastrados, mostra todas as informações do usuário que o criou '.populate('user')' 
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

        return res.status(200).send({ project });

    } catch (error) {
        res.status(400).send({ error: 'Erro ao carregar o projeto' });
    }
});

router.post('/', async (req, res) => {
    try{
        const { title, description, tasks } = req.body;

        const project = await Project.create({ title, description, user: req.userId });

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();

            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.status(200).send({ ok: 'Projeto criado com sucesso!', project});

    }catch (err){
        res.status(400).send({ error: 'Erro ao criar um novo projeto' });
    }
});

router.put('/:projectId', async (req, res) => {
    try{
        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId, 
            { 
                title, 
                description,
            }, { new: true } ); 
            //Por padrão o mongoose não mostra os valores atualizados, mas sim, os antigos. 
            //O 'new: true' faz com que os valores atualizado sejam mostrados

        //Apagando todas tasks (tasks antigas)
        project.tasks = [];
        await Task.remove({ project: project._id });

        //Recriando todas tasks (tasks atualizadas)
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();

            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.status(200).send({ ok: 'Projeto atualizado com sucesso!', project});

    }catch (err){
        res.status(400).send({ error: 'Erro ao atualizar o projeto' });
    }
});

router.delete('/:projectId', async (req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId);

        return res.status(200).send({ ok: 'Projeto deletado com sucesso' });

    } catch (error) {
        res.status(400).send({ error: 'Erro ao deletar o projeto' });
    }
});

module.exports = app => app.use('/projects', router);
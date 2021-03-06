const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/task');


const router = new express.Router();

router.post('/tasks', auth, async (req,res)=>{
    //const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    }catch (e) {
        res.status(400).send(e);
    }
});

// GET /tasks?completed=true

// GET /tasks?limit=10&skip=5 => ilk 5 ini atla 6.'dan itibaren 10 tane göster.
// GET /tasks?limit=10&skip=0 => ilk 10 unu göster.
// GET /tasks?limit=3&skip=3 => ilk 3'ünü atla 4.'den itibaren 3 tane göster.

// GET /tasks?sortBy=createdAt:desc

router.get('/tasks', auth, async (req, res) => {

    const match = {};
    const sort = {};

    if (req.query.completed){
        match.completed= req.query.completed === 'true';
    }

    if (req.query.sortBy){
        const parts = req.query.sortBy.split(':');       // GET /tasks?sortBy=createdAt:desc
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;  // => sort = { createdAt: -1 } => demiş oluyorsun. -1 demek dessc yani azalan şekilde sıralamış olucaksın.
    }

    try {
        await req.user.populate({ //user'ı getirirken user tablosu ile ilişkilendirip ilgili uer objesini getirmemizi sağlıyor.
                                  // task modeline eklediğimiz ref:'User' ve burda yptığımız populate sayesinde bu oluyor.
            path: 'tasks',
            match,              //match bir obje olmak zorunda ve içinde filterlamak istediğimi değerler olmalı. Bu örnekte => /tasks?completed=true =>
                                //completeded query'sine göre bir filtreleme yapıyoruz.
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks)
    }catch (e) {
        res.status(500).send(e);
    }
});

//Burada login olan kullanıcı kendine ait taskı görüntüleyebilir. :id yerine başkasına ait bir task id 'si yazarsan hata verir.
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        //const task = await Task.findById(_id);
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        });
        if (!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', auth, async (req, res)=>{

    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));//every =>bi tane bile uyuşmayan olursa result false.

    if (!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'});
    }
    try {
        //const task = await Task.findById(req.params.id);
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task){
            return res.status(404).send();
        }
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    }catch (e) {
        res.status(404).send(e);
    }
});

router.delete('/tasks/:id', auth, async (req, res)=>{

    try {
        //const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    }catch (e) {
        res.status(500).send();
    }
});
module.exports = router;

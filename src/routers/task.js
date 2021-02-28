const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner : req.user._id
	});
	try {
		const savedTask = await task.save()
		return res.status(201).send(savedTask);
	} catch(e) {
		return res.status(400).send(e);
	}
});


// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth,  async (req, res) => {
	const match = {};

	if(req.query.completed) {
		match.completed = req.query.completed === 'true';
	}

	const sort = {};

	if(req.query.sortBy) {
		const parts = req.query.sortBy.split(":");
		sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
	}

	try {
		await req.user.populate({
			path : 'tasks',
			match,
			options: {
				limit: parseInt(req.query.limit),
				skip: parseInt(req.query.skip),
				sort
			}
		}).execPopulate();
		return res.send(req.user.tasks);
	} catch(e) {
		return res.status(500).send();
	}
});

router.get('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findOne( {_id, owner: req.user._id })
		if(!task) {
			return res.status(404).send();
		}
		return res.send(task);
	} catch(e) {
		return res.status(500).send();
	}
});

router.patch('/tasks/:id', auth, async (req, res) => {
	const taskFields = ['description', 'completed'];
	const fields = Object.keys(req.body);

	const isValidOperation = fields.every((field) => taskFields.includes(field))

	if(!isValidOperation) {
		return res.status(400).send({error : "Invalid Updates!"});
	}

	const _id = req.params.id;

	try {
		const task = await Task.findOne( { _id, owner: req.user._id });
		fields.forEach((field) => task[field] = req.body[field]);
		if(!task) {
			return res.status(404).send();
		}
		await task.save();
		res.send(task);
	} catch(e) {
		res.status(400).send(e);
	}
});

router.delete('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findOneAndDelete( {_id, owner: req.user._id });
		if (!task) {
			return res.status(404).send();
		}
		res.send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
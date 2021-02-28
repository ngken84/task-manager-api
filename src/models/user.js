const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const Task = require('../models/task');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		unique: true,
		validate(value) {
			if(!validator.isEmail(value)) {
				throw new Error('Email is invalid');
			}
		}
	},
	age: {
		type: Number,
		validate(value) {
			if (value < 0) {
				throw new Error('Age must be a positive number.');
			}
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minLength: 7,
		validate(value) {
			if (value.toUpperCase().includes("PASSWORD")) {
				throw new Error('Password must not contain the word "password"');
			}
		}
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}],
	avatar: {
		type: Buffer
	}
}, {
	timestamps : true
});

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner'
});

userSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
}

userSchema.methods.toJSON = function() {
	const user = this;
	const userObject = user.toObject();
	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;
	return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({email: email});
	
	if(!user) {
		throw new Error('Unable to login');
	}

	const isMatched = await bcrypt.compare(password, user.password);
	if(!isMatched) {
		throw new Error('Unable to login');
	}

	return user;
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
	const user = this;
	if(user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});


// Deleting user causes all tasks owned by user
userSchema.pre('remove', async function(next) {
	const user = this;
	await Task.deleteMany({ owner: user._id });
	next();
});


const User =  mongoose.model('User', userSchema);

module.exports = User
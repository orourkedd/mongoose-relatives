var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseRelatives = require('../../lib/index');
var Post = require('./post')

var postSchema = new Schema({
	title: String,
	content: String,
	status: Number,
	__processed: Number
}, {
	_id: true
});

var schema = new Schema({
	firstName: String,
	lastName: String,
	posts: [postSchema]
});

var User = mongoose.model('User', schema);

mongooseRelatives(User, {
	posts: {
		targetModel: Post,
		paths: ['title', 'content']
	}
});

module.exports = User;
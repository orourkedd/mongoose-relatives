var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	title: String,
	content: String
});

module.exports = mongoose.model('Post', schema);
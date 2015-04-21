var _ = require('underscore');

var Relationship = function (resource, path, config) {
	if (!config[path]) {
		throw new Error('no config for path');
	}

	if (!path) {
		throw new Error('path required');
	}

	this.config = config[path];
	this.resource = resource;
	this.path = path;
};

Relationship.prototype.add = function (relationship) {
	if (!relationship._id) {
		throw new Error('_id is required for a valid relationship');
	}

	//Make sure this does not already exist in relationship
	for (var i in this.resource[this.path].toObject()) {
		if (this.resource[this.path][i]._id.toString() == relationship._id.toString()) {
			return;
		}
	}

	this.resource[this.path].push(relationship);
};

Relationship.prototype.remove = function (relationship) {
	if (!relationship._id) {
		throw new Error('_id is required for a valid relationship');
	}

	for (var i in this.resource[this.path].toObject()) {
		if (this.resource[this.path][i]._id.toString() == relationship._id.toString()) {
			this.resource[this.path].splice(i, 1);
			break;
		}
	}
};

Relationship.prototype.update = function (relationship) {
	if (!relationship._id) {
		throw new Error('_id is required for a valid relationship');
	}

	var index = null;
	//Make sure this does not already exist in relationship
	for (var i in this.resource[this.path].toObject()) {
		if (this.resource[this.path][i]._id.toString() == relationship._id.toString()) {
			index = i;
			break;
		}
	}

	if (!index) {
		throw new Error('Relationship does not exist.')
	}

	_.extend(this.resource[this.path][index], relationship);
};

module.exports = Relationship;
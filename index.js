var async = require('async');

module.exports = function (model, config) {

	if (!config.property) {
		throw new Error('property required.');
	}

	model.schema.pre('save', function (next) {
		var self = this;

		if (!self[config.property]) {
			return next();
		}

		var collection = self[config.property].toObject();
		var setters = []

		for (var i in collection) {
			if (collection[i].__processed !== true) {
				setters.push((function (item) {

					//Update the actual relationship entry, not the copy (item)
					for (var k in self[config.property]) {
						var relationship = self[config.property][k];
						if (relationship._id.toString() == item._id.toString()) {
							//Assign item
							item = self[config.property][k];
							break;
						}
					}

					return function (done) {
						config.targetModel.findOne({
								_id: item._id
							},
							function (err, doc) {
								if (err) {
									return done(err);
								}

								if (!doc) {
									return done(new Error('Relationship points to document that does not exist.'));
								}

								for (var j in config.properties || []) {
									item[config.properties[j]] = doc[config.properties[j]]
								}

								item.__processed = true;

								return done();
							}
						)
					};
				})(collection[i]));
			}
		}

		async.parallel(setters, function (err, results) {
			if (err) {
				return next(err);
			} else {
				self.markModified(config.property);
				next();
			}
		});
	});
};
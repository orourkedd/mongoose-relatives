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

		collection.forEach(function (item, i) {
			if (!item.__processed) {
				return;
			}

			setters.push((function (item, i) {
				//Get the actual relationship object, not a copy
				item = self[config.property][i];

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

							//update properties
							for (var j in config.properties || []) {
								item[config.properties[j]] = doc[config.properties[j]]
							}

							//mark as processed so this doesn't happen on every save
							item.__processed = (new Date()).getTime();

							return done();
						}
					)
				};
			})(item, i));

		});

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
var async = require('async');
var Relationship = require('./relationship');
var mongoose = require('mongoose');

module.exports = function (model, config) {

	//Add helper methods
	model.prototype.relationship = function (path) {
		return new Relationship(this, path, config);
	};

	//Add Middleware
	for (var p in config) {
		var pathConfig = config[p];

		//create middleware in closure for easy access to pathConfig
		(function (path, pathConfig) {

			model.schema.pre('save', function (next) {
				var self = this;

				if (!self[path]) {
					return next();
				}

				var collection = self[path].toObject();
				var setters = [];

				collection.forEach(function (item, i) {
					if (item.__processed) {
						return;
					}

					setters.push((function (item, i) {
						//Get the actual relationship object, not a copy
						item = self[path][i];

						//put this here to delay it so we know all models are loaded
						if('string' === typeof pathConfig.targetModel) {
							pathConfig.targetModel = mongoose.models[pathConfig.targetModel]
						}

						return function (done) {
							pathConfig.targetModel.findOne({
									_id: item._id
								},
								function (err, doc) {
									if (err) {
										return done(err);
									}

									//update paths
									if (doc) {
										for (var j in pathConfig.paths || []) {
											item[pathConfig.paths[j]] = doc[pathConfig.paths[j]]
										}

										//mark as processed so this doesn't happen on every save
										item.__processed = (new Date()).getTime();
									}

									//Do any post-processing
									if('function' === typeof pathConfig.after) {
										pathConfig.after(doc, function(err){
											done(err);
										})
									}
									else {
										return done();
									}
								}
							)
						};
					})(item, i));

				});

				async.parallel(setters, function (err, results) {
					if (err) {
						return next(err);
					} else {
						self.markModified(path);
						next();
					}
				});
			});
		})(p, pathConfig);

	}
};

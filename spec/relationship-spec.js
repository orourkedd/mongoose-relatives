var expect = require('chai').expect;
var User = require('./models/user');
var Post = require('./models/post');

var userBuild = function () {
	return new User({
		firstName: 'Charles',
		lastName: 'Spurgeon'
	});
};

var postFactory = function (done) {
	var post = new Post({
		title: 'abc',
		content: 'def'
	});

	post.save(function (err) {
		done(err, post);
	});
};

describe('Relationship', function () {
	describe('#add', function () {

		it('should add a new relationship', function (done) {
			postFactory(function (err, post) {
				if (err) {
					return done(err);
				}

				var user = userBuild();
				user.relationship('posts').add({
					_id: post._id
				});
				user.save(function (err) {
					if (err) {
						return done(err);
					}

					expect(user.posts[0].title).to.eq(post.title);
					expect(user.posts[0].content).to.eq(post.content);
					done();
				});
			});
		});

		it('should update __processed after add', function (done) {
			postFactory(function (err, post) {
				if (err) {
					return done(err);
				}

				var user = userBuild();
				user.relationship('posts').add({
					_id: post._id
				});
				user.save(function (err) {
					if (err) {
						return done(err);
					}

					expect(user.posts[0].__processed).to.be.ok;
					done();
				});
			});
		});

		it('should not create duplicate relationships', function (done) {
			postFactory(function (err, post) {
				if (err) {
					return done(err);
				}

				var user = userBuild();
				user.relationship('posts').add({
					_id: post._id
				});

				user.relationship('posts').add({
					_id: post._id
				});
				user.save(function (err) {
					if (err) {
						return done(err);
					}

					expect(user.posts.length).to.eq(1);
					done();
				});
			});
		});
	});

	describe('#remove', function () {

		it('should remove a relationship', function (done) {
			postFactory(function (err, post) {
				if (err) {
					return done(err);
				}

				var user = userBuild();
				user.relationship('posts').add({
					_id: post._id
				});

				user.relationship('posts').add({
					_id: post._id
				});

				expect(user.posts.length).to.eq(1);

				user.relationship('posts').remove({
					_id: post._id
				});

				expect(user.posts.length).to.eq(0);
				done();
			});
		});

	});


	describe('#update', function () {

		it('should update an existing relationship', function (done) {
			postFactory(function (err, post) {
				if (err) {
					return done(err);
				}

				var user = userBuild();
				user.relationship('posts').add({
					_id: post._id
				});

				user.relationship('posts').add({
					_id: post._id
				});

				user.save(function (err) {
					if (err) {
						return done(err);
					}

					expect(user.posts[0].status).not.to.be.ok;

					user.relationship('posts').update({
						_id: post._id,
						status: 5
					});

					expect(user.posts[0].status).to.eq(5);
					done();
				});
			});
		});

	});
});
'use strict';

var router = require('express').Router();

var HttpError = require('../utils/HttpError');
var User = require('../api/users/user.model');
var crypto = require('crypto');

var secret = 'abcdef';






router.post('/login', function (req, res, next) {
	//make sure the body is just an email and pass
	if (req.body.email || req.body.password) {
	var email = req.body.email;
	var pass = req.body.password;
	// if (email.search(/[\s\(\)]/) === -1 && pass.search(/[\s\(\)]/) === -1) {

	User.findOne({email: email}).exec()
	.then(function (user) {
		if (!user) throw HttpError(401);
		//hash that pass
		
		var hashPass = crypto.pbkdf2Sync(pass, user.salt, 100000, 512, 'sha512')
		if (hashPass === user.password) {
			req.login(user, function () {
				res.json(user);
			});
		} else { res.sendStatus(401) }
	})
	.then(null, next);
	} else {res.sendStatus(403)}
});

router.post('/signup', function (req, res, next) {
	//make sure the body is just an email and pass
	var buffer = crypto.randomBytes(64);
	var email = req.body.email;
	var pass = req.body.password;
	var salt = buffer;
	var hash = crypto.pbkdf2Sync(pass, salt, 100000, 512, 'sha512')
	console.log('email', email, 'password', hash)
	// console.log (email.search(/[\s\(\)]/))
	// if (email.search(/[\s\(\)]/) === -1 && pass.search(/[\s\(\)]/) === -1) {

	req.body.isAdmin = false;
	User.create({email: email, password: hash, salt: salt})
	.then(function (user) {
		req.login(user, function () {
			res.status(201).json(user);
		});
	})
	.then(null, next);
// } else {res.sendStatus(403)}
});

router.get('/me', function (req, res, next) {
	res.json(req.user);
});

router.delete('/me', function (req, res, next) {
	req.logout();
	res.status(204).end();
});

router.use('/google', require('./google.oauth'));

router.use('/twitter', require('./twitter.oauth'));

router.use('/github', require('./github.oauth'));

module.exports = router;
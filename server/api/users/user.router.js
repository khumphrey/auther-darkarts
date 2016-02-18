'use strict';

var router = require('express').Router(),
    _ = require('lodash');

var HttpError = require('../../utils/HttpError');
var User = require('./user.model');

router.param('id', function(req, res, next, id) {
	//make sure this is only id
	//only accept id
		// if (id.search(/[\s\(\)]/) === -1 ) {

    User.findById(id).exec()
        .then(function(user) {
            if (!user) throw HttpError(404);
            req.requestedUser = user;
            next();
        })
        .then(null, next);
    // } else {res.sendStatus(403)}

});

router.get('/', function(req, res, next) {
    if (req.user) next()
    else  next(HttpError(401))
}, function(req, res, next) {
    User.find({}).exec()
        .then(function(users) {
            users.forEach(function(user) {
                user.password = "";
                user.google = {};
                user.twitter = {};
                user.github = {};
            })
            res.json(users);
        })
        .then(null, next);
});

function assertAdmin(req, res, next){
 if (!req.user) next(HttpError(401))
    else  if (!req.user.isAdmin) next(HttpError(403));
    else next()
}

router.post('/', assertAdmin, function(req, res, next) {
	//post should have email, pass, phone, and maybe isAdmin?
	// console.log(req.body)
	var email = req.body.email;
	var name = req.body.name;
	var number = req.body.phone;


	// if (email.search(/[\s\(\)]/) === -1 && name.search(/[\(\)]/) === -1 && number.search(/[\(\)]/)) {

	// console.log(req.body)
    // req.body.isAdmin = false;
    User.create({email: email, password: pass})
        .then(function(user) {
            res.status(201).json(user);
        })
        .then(null, next);
        	// } else {res.sendStatus(403)}

});

router.get('/:id', function(req, res, next) {
	// should do something so that if it is a visitor not everything is sent back
    req.requestedUser.getStories()
        .then(function(stories) {
            var obj = req.requestedUser.toObject();
            obj.stories = stories;
            res.json(obj);
        })
        .then(null, next);
});

function assertAdminOrSelf(req, res, next){
    if (!req.user) next(HttpError(401))
    else  if (!req.user.isAdmin && !req.user.equals(req.requestedUser)) next(HttpError(403));
    else next()
}

router.put('/:id', assertAdminOrSelf, function(req, res, next) {
	if (req.user.equals(req.requestedUser)) delete req.body.isAdmin
        _.extend(req.requestedUser, req.body);
        req.requestedUser.save()
            .then(function(user) {
            	 user.password = "";
                user.google = {};
                user.twitter = {};
                user.github = {};
                res.json(user);
            })
            .then(null, next);

});

router.delete('/:id', assertAdminOrSelf, function(req, res, next) {
    console.log(req.user)

        req.requestedUser.remove()
            .then(function() {
                res.status(204).end();
            })
            .then(null, next);
});

module.exports = router;
'use strict';

var router = require('express').Router(),
    _ = require('lodash');

var HttpError = require('../../utils/HttpError');
var User = require('./user.model');

router.param('id', function(req, res, next, id) {
    User.findById(id).exec()
        .then(function(user) {
            if (!user) throw HttpError(404);
            req.requestedUser = user;
            next();
        })
        .then(null, next);
});

router.get('/', function(req, res, next) {
    // if (req.user) {
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
    // } else { res.sendStatus(401)}
});

router.post('/', function(req, res, next) {
    req.body.isAdmin = false;
    User.create(req.body)
        .then(function(user) {
            res.status(201).json(user);
        })
        .then(null, next);
});

router.get('/:id', function(req, res, next) {
	console.log(req.user)
	  if (req.user) {
    req.requestedUser.getStories()
        .then(function(stories) {
            var obj = req.requestedUser.toObject();
            obj.stories = stories;
            res.json(obj);
        })
        .then(null, next);
            } else { res.sendStatus(401)}
});

router.put('/:id', function(req, res, next) {
    console.log('requestedUser', req.requestedUser)
    if (req.user.isAdmin === true || req.user._id === req.requestedUser._id) {
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
    } else { res.sendStatus(401) }

});

router.delete('/:id', function(req, res, next) {
    console.log(req.user)
    if (req.user.isAdmin === true) {

        req.requestedUser.remove()
            .then(function() {
                res.status(204).end();
            })
            .then(null, next);
    } else { res.sendStatus(401) }
});

module.exports = router;
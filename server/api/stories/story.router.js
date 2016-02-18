'use strict';

var router = require('express').Router(),
    _ = require('lodash');

var HttpError = require('../../utils/HttpError');
var Story = require('./story.model');

router.param('id', function(req, res, next, id) {
    Story.findById(id).exec()
        .then(function(story) {
            if (!story) throw HttpError(404);
            req.story = story;
            next();
        })
        .then(null, next);
});

router.get('/', function(req, res, next) {
    Story.find({}).populate('author').exec()
        .then(function(stories) {
        	stories.forEach(function(story) {
                story.author.password = "";
                story.author.google = {};
                story.author.twitter = {};
                story.author.github = {};
            })
            res.json(stories);
        })
        .then(null, next);
});

router.post('/', function(req, res, next) {

    if (req.user) {
    	if(req.body.author === req.user._id) {

        Story.create(req.body)
            .then(function(story) {
                return story.populateAsync('author');
            })
            .then(function(populated) {
            	populated.author.password = "";
                populated.author.google = {};
                populated.author.twitter = {};
                populated.author.github = {};
                res.status(201).json(populated);
            })
            .then(null, next);
    	} else {res.sendStatus(401)  }
} else {res.sendStatus(401)  }
});

router.get('/:id', function(req, res, next) {
    req.story.populateAsync('author')
        .then(function(story) {
        		story.author.password = "";
                story.author.google = {};
                story.author.twitter = {};
                story.author.github = {};
            res.json(story);
        })
        .then(null, next);
});

router.put('/:id', function(req, res, next) {
	console.log('story', req.story.author, 'currentuser', req.user)
    if (req.user.isAdmin === true || req.story.author === req.user._id) {

        _.extend(req.story, req.body);
        req.story.save()
            .then(function(story) {
            	story.author.password = "";
                story.author.google = {};
                story.author.twitter = {};
                story.author.github = {};
                res.json(story);
            })
            .then(null, next);
    } else { res.sendStatus(401) }

});

router.delete('/:id', function(req, res, next) {
		console.log('story', req.story, 'currentuser', req.user)
    if (req.user.isAdmin === true || req.story.author === req.user._id) {
        req.story.remove()
            .then(function() {
                res.status(204).end();
            })
            .then(null, next);
    } else { res.sendStatus(401)  }

});

module.exports = router;
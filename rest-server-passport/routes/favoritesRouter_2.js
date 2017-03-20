var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());

favoritesRouter
	.route('/')

	.all(Verify.verifyOrdinaryUser)

	.get(function (req, res, next) {
	var userId = req.decoded._doc._id

	Favorites.find({ postedBy: userId })
		.populate(['postedBy', 'dishes'])
		.exec(function (err, favorite) {
		if(err) throw err;
		res.json(favorite);
	})
})

	.post(function (req, res, next) {
	var userId = req.decoded._doc._id
	var dishId = req.body._id

	Favorites.findOneAndUpdate({postedBy :userId},
							   {$addToSet:{dishes:req.body}},
							   {upsert:true, new: true})
		.exec(function (err, favorite) {
		if(err) throw err;
		res.json(favorite);
	});
})

	.delete(function (req, res, next) {
	var userId = req.decoded._doc._id

	Favorites.remove({ postedBy: userId }, function (err, favorite) {
		if(err) throw err;
		res.json(favorite);
	})
})

favoritesRouter
	.route('/:dishId')

	.all(Verify.verifyOrdinaryUser)

	.delete(function (req, res, next) {
	var userId = req.decoded._doc._id
	var dishId = req.body._id

	Favorites.findOneAndUpdate({'postedBy': userId}, 
							   {$pull: {dishes: req.params.dishId}},
							   {new: true})
		.exec(function (err, favorite) {
		if(err) throw err;
		res.json(favorite);
	});
});

module.exports = favoritesRouter
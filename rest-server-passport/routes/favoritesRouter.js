var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoritiesRouter = express.Router();
favoritiesRouter.use(bodyParser.json());

favoritiesRouter.route('/')
    .all(Verify.verifyOrdinaryUser)

    .get(function (req, res, next) {
        var user_id = req.decoded._doc._id;

        Favorites.find({
                "postedBy": user_id
            })
            .populate('postedBy')
            .populate('dishes')
            .exec(function (err, fav) {
                if (err) throw err;
                res.json(fav);
            });
    })

    .post(function (req, res, next) {
        var newObj = {
            postedBy: req.decoded._doc._id
        };
        Favorites.create(newObj, function (err, fav) {
            if (err) throw err;
            console.log('Fav created!');
            var id = fav._id;
            fav.dishes.push(req.body);
            fav.save(function (err, dish) {
                if (err) throw err;
                console.log('Updated Dishes!');
                res.json(fav);
            });
        });
    })

    .delete(function (req, res, next) {
        var user_id = req.decoded._doc._id;
        Favorites.remove({
            "postedBy": user_id
        }, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

favoritiesRouter.route('/:dishObjectId')
    .all(Verify.verifyOrdinaryUser)

    .delete(function (req, res, next) {
        var user_id = req.decoded._doc._id;
        Favorites.find({"postedBy": user_id}, function (err, fav) {
            fav.dishes.id(req.params.dishObjectId).remove();
            fav.save(function (err, resp) {
                if (err) throw err;
                res.json(resp);
            });
        });
    });

module.exports = favoritiesRouter;
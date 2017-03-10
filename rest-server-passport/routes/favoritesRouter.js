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

        Favorites.find({
            "postedBy": req.decoded._doc._id
        }, function (err, fav) {
            if (fav != null && fav.length > 0) {
                var index = fav[0].dishes.indexOf(req.body._id);
                console.log(index);
                if (index != -1) res.json(fav);
                else {
                    fav[0].dishes.push(req.body._id);
                    fav[0].save(function (err, dish) {
                        if (err) throw err;
                        console.log('Updated Dishes!');
                        res.json(fav);
                    });
                }
            } else {
                Favorites.create(newObj, function (err, fav) {
                    if (err) throw err;
                    console.log('Fav created!');
                    fav.dishes.push(req.body._id);
                    fav.save(function (err, dish) {
                        if (err) throw err;
                        console.log('Updated Dishes!');
                        res.json(fav);
                    });
                });
            }
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
        console.log(user_id);
        Favorites.find({
            "postedBy": user_id
        }, function (err, fav) {
            if (err) throw err;
            var index = fav[0].dishes.indexOf(req.params.dishObjectId);
            fav[0].dishes.splice(index, 1);
            fav[0].save(function (err, resp) {
                if (err) throw err;
                res.json(resp);
            });
        });
    });

module.exports = favoritiesRouter;
var express = require('express')
var tweetBank = require('../tweetBank')

//Integration with Models
var User = require('../models/index.js').User;
var Tweet = require('../models/index.js').Tweet;

module.exports = function(io) {
	var router = express.Router()

	router.get('/', function(req, res) {
		var tweetArray = [];



		Tweet.findAll({ include: [ User ] })
		.then(function(tweets) {
			for (var i = 0; i < tweets.length; i++) {
				tweetArray.push(tweets[i].dataValues);

			}

			console.log(tweetArray);

			res.render('index', {
				tweets: tweetArray,
				showForm: true
			})
		})

	})

	router.get('/users/:name', function(req, res) {

		var tweetArray = [];
		var userName = req.params.name

		User.findAll({ include: [ {model: Tweet, required: true}], where: {name: userName}})
		.then(function(tweets) {
			for (var i = 0; i < tweets[0].Tweets.length; i++) {
				tweetArray.push(tweets[0].Tweets[i].dataValues);
			}
			res.render('index', {
				tweets: tweetArray,
				formName: userName,
				showForm: true
			})
		})
	})

	router.get('/users/:name/tweets/:id', function(req, res){
		req.params.id = parseInt(req.params.id)
		var tweets = tweetBank.find({id: req.params.id})
		res.render('index', {
			tweets: tweets
		})
	})

	router.post('/submit', function(req, res){
		var userName = req.body.name;
		var tweetText = req.body.text;
		var tableUserId = "";
		var tweetArray = [];
		//(1) See if userName already exists in Users table
		// (1a) IF it does, THEN get the ID of the User and RETURN
		// (1b) ELSE CREATE userName in Users table and return User ID
		//(2) Create a new tweetText in the Tweet table with a userId from 1a/1b and an auto-incremented ID

		User.findOrCreate({ where: {name: userName}, defaults: {} })
		.then(function(user) {
			tableUserId = user[0].dataValues.id;
			// console.log("WROTE TO USER TABLE " + tableUserId);
			Tweet.create({UserId: tableUserId, tweet: tweetText});
			// console.log("WROTE TO TWEET TABLE, NEW TWEET " + tweetText);
			}
		)

		//OLD CODE!!!

		//Select all tweets from database and push them into tweetArray

		//TODO

		Tweet.findAll({ include: [ User ] })
		.then(function(tweets) {
			for (var i = 0; i < tweets.length; i++) {
				tweetArray.push(tweets[i].dataValues);
				var all_tweets = tweetArray;
				var last_tweet = all_tweets[all_tweets.length-1];
				// last_tweet = last_tweet[last_tweet.length-1];
				console.log(last_tweet);
				io.sockets.emit('new_tweet', last_tweet)
			}
		})
		// res.redirect(req.body.redirectUrl)
		// res.redirect('/')
	})

	return router
}








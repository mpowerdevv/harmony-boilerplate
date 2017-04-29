/**
 * Using Rails-like standard naming convention for endpoints.
 * POST    /users              ->  create
 * GET     /users/me           ->  me
 * DELETE  /users/me/logout    ->  logout
 * POST    /users/login        ->  login
 */

const _ = require('lodash');
const {ObjectID} = require('mongodb');

const User = require('./user-model');
const RESPONSES = require('../responses');

exports.create = function(req, res) {

	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
        res.header('x-auth', token).send(user);
	}).catch((e) => {
        res.status(403).json(RESPONSES.GENERAL_ERROR);
	});
};

// Get the current user
exports.me = function(req, res) {
	res.send(req.user);
};

exports.login = function(req, res) {

	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) => {
		user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
        res.status(403).json(RESPONSES.LOGIN_ERROR);
	});

};


exports.logout = function(req, res) {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(403).json(RESPONSES.GENERAL_ERROR);
	});
};
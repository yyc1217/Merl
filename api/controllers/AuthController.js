/* global LoginLog */
/* global sails */
var passport = require('passport');

module.exports = {

	index: function (req, res) {
		'use strict';
		return res.view();
	},

	logout: function (req, res) {
		'use strict';
		req.logout();
		return res.redirect('/');
	},

	facebook: function (req, res) {
		'use strict';

		passport.authenticate('facebook', {
			failureRedirect: '/login',
			scope: ['public_profile']
		}, function afterFacebookAuthenticate(err, user) {
			if (err) {
				sails.log.error(err);
				res.view('500');
				return;
			}

			req.logIn(user, function afterFacebookLogin(error) {
				if (error) {
					sails.log.error(error);
					res.view('500');
					return;
				}
				
				LoginLog.log(req, function afterLoginLog () {
					res.redirect('/');
				});
			});
		})(req, res);
	},
	
	google: function (req, res) {
		'use strict';

		passport.authenticate('google', {
			failureRedirect: '/login',
			scope: ['https://www.googleapis.com/auth/plus.login']
		}, function afterGooglePlusAuthenticate (err, user) {
			if (err) {
				sails.log.error(err);
				res.view('500');
				return;
			}

			req.logIn(user, function afterGooglePlusLogin(error) {
				if (error) {
					sails.log.error(error);
					res.view('500');
					return;
				}
				
				LoginLog.log(req, function afterLoginLog () {
					res.redirect('/');
				});
			});
		})(req, res);
	}
};
/* global sails */
/* global LoginLog */
/**
* LoginLog.js
*
* @description :: 使用者登入紀錄
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		no: {
			type : 'integer',
			primaryKey: true,
			autoIncrement: true
		},

		uid : {
			type : 'string',
			required : true
		},

		userAgent : {
			type : 'string',
			columnName : 'user_agent'
		},

		ip : {
			type : 'string',
			required : true
		}
	},
	
	log : function log (req, cb) {
		'use strict';

		var data = {
			uid : req.session.passport.user,
			userAgent : req.headers['user-agent'],
			ip : req.ip
		};

		LoginLog.create(data)
		.exec(function (err, newLog) {
			if (err) {
				sails.log.err(err);
				return;
			}
			cb(newLog);
		});
	}
};
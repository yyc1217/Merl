/* global sails */
/* global Pick */
/**
 * PickController
 *
 * @description :: 接受選秀選擇
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
	/*
		建立選秀選擇
	*/
	create: function (req, res) {
		'use strict';

		var userId = req.session.passport.user;

		if (!req.isSocket) {
			sails.log.warn('欲使用socket以外的方式投單', req.session);
			return res.send(503);
		}
		
		// 未登入
		if (!userId) {
			sails.log.warn('欲投單但未登入 ', req.session);
			return res.send(503);
		}

		// 未選擇隊伍
		if (!req.session.teamBelongsTo) {
			sails.log.warn('欲投單但未選擇隊伍 ', req.session);
			return res.send(503);
		}

		var submitPick = {
			round: req.param('round'),
			draftNo: req.param('draftNo'),
			uid: userId,
			isDeleted: false
		};
		
		sails.log.debug('預防重覆投單 ', submitPick);
		
		Pick.find(submitPick).exec(function searchExist(err, result) {
			if (err) {
				sails.log.error(err);
				return res.send('fail');
			}
			
			sails.log.debug('搜尋結果：', result);
			
			if (!_.isEmpty(result)) {
				sails.log.error('可能是惡意的行為，嘗試投重覆的單！');
				res.send('fail');
				return;
			}
			
			submitPick.name = req.param('name');
			submitPick.team = req.session.teamBelongsTo;
			
			Pick.create(submitPick).exec(function createPick(err, created) {
				if (err) {
					sails.log.err(err);
					res.send('fail');
				} else {
					sails.log.debug('建立投單 ', created);
					res.send('success');
				}
			});
		});

	},
	
	missing: function (req, res) {
		'use strict';
		
		if (!req.isSocket) {
			sails.log.warn('欲使用socket以外的方式補遺', req.session);
			return res.send(503);
		}
	
		var missing = {
			round : req.param('round'),
			team : req.param('team')
		};
		
		Result.findLatestByMissing(missing, function(err, result) {
			if (err) {
				return res.send('fail');
			}
			var data = {
				team : result[0] && result[0].team,
				name : result[0] && result[0].name,
				round : result[0] && result[0].round
			};
			res.send(data);
		});
	}
};
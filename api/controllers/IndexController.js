/* global sails */
/**
 * IndexController
 *
 * @description :: Home page
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');

module.exports = {
	/*
		首頁
	*/
	index: function (req, res) {
		'use strict';

		var renderData = {
			
			// 使用者資訊
			user : null,
			
			// 代表的隊伍
			teamBelongsTo : null,
			
			// 目前模擬選秀的階段
			state : req.state,
			
			// 候選人
			candidates: req.candidates,
			
			// 參與隊伍
			teams: req.teams,
			
			// 到目前為止的選秀結果
			resultTable : req.resultTable,
			
			// 已被選擇的球員
			pickedCandidates : req.pickedCandidates,
			
			// 需要被隊伍忽略的球員
			ignoreCandidates : req.ignoreCandidates,
			
			// 最近一次的模擬選秀結果
			latestDraftResult : req.latestDraftResult,

			// official draft info
			officialDraft : req.officialDraft
		};

		if (req.latestDraft) {

			// 接下來最新的選秀資訊
			renderData.latestDraft : req.latestDraft;

			// 接下來最新的選秀時間
			renderData.latestDraftTime : moment(req.latestDraft.createdAt).format('YYYY-MM-DD hh:mm');
		}

		if (req.user) {
			renderData.user = req.user;
		}

		if (req.session.teamBelongsTo) {
			renderData.teamBelongsTo = req.session.teamBelongsTo;
		}

		// 已登入但還未選擇代表的隊伍
		if (req.user && !req.session.teamBelongsTo) {
			return res.redirect('/manager');
		}

		return res.view('homepage', renderData);
	},

	/*
		首頁載入後，會向server要目前進行中選秀的資訊
	*/
	hello: function (req, res) {
		'use strict';

		var resData = {
			
			// 目前選秀的階段
			state: req.state,
			
			// 離目前階段結束的秒數
			countDownSeconds : -1
		};


		if (req.state === 'INIT') {	// 是初始的階段
			
			// 使用固定的時間點
			resData.countDownSeconds = sails.config.draft.startDraftTime().diff(moment(), 'seconds');
			
		} else if (req.state === 'WAIT') { // 是等待選擇的階段
			
			// 輪次
			resData.round = req.round;
			
			// 使用倒數的秒數
			resData.countDownSeconds = req.waitCountDownSeconds;
			
		} else if (req.state === 'FINISHED') { //本次選秀已結束
			
			if (sails.config.environment == 'development') {
				resData.countDownSeconds = sails.config.draft.restartDraftSeconds;
			} else {
				resData.countDownSeconds = null;
			}
		}

		return res.send(resData);
	}
};

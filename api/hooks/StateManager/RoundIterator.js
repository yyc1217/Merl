/* global sails */
/**
 * RoundIterator
 *
 * @description :: 用來決定下一個輪次
 */
var async = require('async');

module.exports = (function () {
	'use strict';

	var counter = 0,
		teams = [],
		draft = {},
		ignoreRounds = [],
		giveUpTeams = [],
		candidates = [],
		pickedCandidates = [];

	return {

		/**
		 * 目前的輪次
		 */ 
		round : {},
		
		init : function (options) {
			counter = 0;
			teams = options.teams;
			draft = options.draft;
			candidates = options.candidates;
			ignoreRounds = options.ignoreRounds;
			giveUpTeams = [];
			pickedCandidates = [];
		},
		
		/**
		 * 回傳目前的輪次
		 */ 
		current : function () {
			return this.round;
		},
		
		prev : function () {
			counter -= 1;
		},

		/**
		 * 取得下一個輪次
		 */ 
		next : function () {

			// 移到下一個暫定的輪次
			var moveCursor = function () {
				counter += 1;
				return {
					draft: draft,
					team: teams[((counter - 1) % teams.length)],
					round : Math.ceil(counter / teams.length),
					count : counter
				};
			},
			
			/**
			 * 應該跳過該輪次
			 */	
			shouldIgnore = function (round) {
				return !!_.findWhere(ignoreRounds, {team: round.team.ename, round: round.round});
			},

			/**
			 * 該隊伍已放棄
			 */ 
			alreadyGiveUp = function (round) {
				return !!_.findWhere(giveUpTeams, round.team);
			};

			if (!this.hasNext()) {return {}; }

			// 暫定的輪次
			var tempRound = moveCursor();

			while (shouldIgnore(tempRound) || alreadyGiveUp(tempRound)) {
				sails.log.info('**************************************');
				sails.log.info('隊伍：', tempRound.team.cname, ', 輪次：', tempRound.round, '已放棄');
				sails.log.info('理由：', shouldIgnore(tempRound) ? '被預先放棄的輪次.' : '已放棄該輪次');
				tempRound = moveCursor();
			}

			this.round = tempRound;
			return this.round;
		},

		hasNext : function () {
			if (teams.length === giveUpTeams.length) {
				sails.log.info('所有的隊伍皆放棄');
				return false;
			}

			if (pickedCandidates.length >= candidates.length) {
				sails.log.info('沒有候選人可以選了');
				return false;
			}
			return true;
		},

		/**
		 * 若最終結果為放棄，則加入giveUpTeams
		 */ 
		giveUpIfNeccessary : function (result) {
			if (result.name === '放棄') {
				giveUpTeams.push(this.round.team);
			}
		},

		/**
		 * 加入該輪次的選擇結果
		 */  
		addPicked : function (result) {
			if (result.name !== '放棄') {
				var name = result.name || '未投單',
					pickedCandidate = { name: name };
					
				_.extend(pickedCandidate, this.round);
				pickedCandidates.push(pickedCandidate);
			}
		},

		/**
		 * 已被選走的球員
		 */ 
		pickedCandidates : function () {
			return pickedCandidates;
		}
	};
}());
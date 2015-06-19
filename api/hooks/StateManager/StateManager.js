/* global Result */
/* global Pick */
/// <reference path="../../../typings/async/async.d.ts"/>
/// <reference path="../../../typings/underscore/underscore.d.ts"/>
/* global sails */
/**
 * StateManager
 *
 * @description :: 一個有限狀態機，用來管理選秀的階段
 */
var Stately = require('stately.js'),
	moment = require('moment'),
	roundIterator = require('./RoundIterator.js'),
	initSteps = require('./initSteps.js'),
	resultTable = require('./ResultTable.js');

var manager = Stately.machine({
	// dummy
	'DUMMY' : {
		'next' : 'STANDBY'
	},
	
	// 系統啟動後，選秀開始前 
	'STANDBY' : {
		'next' : 'INIT'
	},
	
	// 選秀開始系統初始化
	'INIT' : {
		'next' : 'WAIT'
	},
	
	// 選秀中，等待選秀結果
	'WAIT' : {
		'next' : 'CALCULATE'
	},
	
	// 該輪次結束，計算結果
	'CALCULATE' : {
		'next' : 'BREAK'
	},
	
	// 計算結束後
	'BREAK' : {
		'wait' : 'WAIT',
		'done' : 'FINISHED'
	},
	
	// 本系統所有動作結束
	'FINISHED' : {
	}
});

/**
 * 被掛載到request上的參數
 * 
 * @see RoundIterator.js
 */
manager.hookParams = function () {
	'use strict';

	var params = {
		
		// 目前選秀階段
		state : manager.getMachineState(),
		
		// 目前選秀的輪次
		round : roundIterator.current(),
		
		// 目前選秀的結果
		resultTable : resultTable.display(),
		
		// 目前選秀已選擇的球員
		pickedCandidates : roundIterator.pickedCandidates(),
		
		// 本次輪次結束的秒數
		waitCountDownSeconds : manager.waitCountDownSeconds()
	};

	_.extend(params, manager.initData);
	return params;
};

/**
 * 本次輪次結束的秒數
 */
manager.waitCountDownSeconds = function () {
	'use strict';
	return manager.waitDeadline && manager.waitDeadline.diff(moment(), 'seconds');
};

manager.onDUMMY = function (event, oldStage, newStage) {'use strict'; };

/**
	Waiting for server loaded completely.
*/
manager.onSTANDBY = function (event, oldStage, newStage) {
	'use strict';

	var self = this;
	sails.after('lifted', function () {
		self.setMachineState(self.INIT);
	});

};

/**
	preparing next draft
*/
manager.onINIT = function (event, oldStage, newStage) {
	'use strict';

	var self = this;

	sails.log.info('初始化選秀資料');

	async.waterfall(initSteps(), function (err, results) {

		roundIterator.init(results);
		resultTable.init(results);

		manager.initData = results;

		var startAt = sails.config.draft.startDraftTime({refresh : true});

		sails.log.info('');
		sails.log.info('選秀 #' + results.draft.no + ' 即將開始於 ' + startAt.format());

		// 避免瀏覽器倒數時間太長，與伺服器的差距會越來越大
		var calibaration = setInterval(function() {
			sails.sockets.blast('calibrate', {
				countDownSeconds: startAt.diff(moment(), 'seconds')
			});
		}, 20000);
		
		setTimeout(function () {
			clearInterval(calibaration);
			sails.log.info('選秀 #' + results.draft.no + ' 開始');
			self.setMachineState(self.WAIT);
		}, startAt.diff(moment()));
	});
};


/**
	waiting stage
*/
manager.onWAIT = function (event, oldStage, newStage) {
	'use strict';

	var countDown = sails.config.draft.waitPickSeconds * 1000,
		self = this,
		round = roundIterator.next(),
		countDownSeconds = sails.config.draft.waitPickSeconds;

	sails.log.info('**************************************');
	sails.log.info('隊伍:', round.team.cname, ', 輪次:', round.round, '開始.');

	round.countDownSeconds = countDownSeconds;
	manager.waitDeadline = moment().add(countDownSeconds, 'seconds');
	sails.log.info('等待使用者投單，結束於：', manager.waitDeadline.format());
	
	sails.sockets.blast('pick:start', round);
	
	// 前10秒校正
	setTimeout(function () {
		sails.sockets.blast('calibrate', {
			countDownSeconds: 10
		});		
	}, countDown - 10000);
	
	setTimeout(function () {
		sails.sockets.blast('pick:stop');
		self.setMachineState(self.CALCULATE);
	}, countDown);
};

/**
	calculating stage
*/
manager.onCALCULATE = function (event, oldStage, newStage) {
	'use strict';

	var round = roundIterator.current(),
		self = this,
		sql = ' SELECT name, count(*) '
			+ ' FROM pick '
			+ ' WHERE draft_no = ' + manager.initData.draft.no
			+ ' AND team = \'' + round.team.ename + '\' '
			+ ' AND round = ' + round.round
			+ ' AND is_deleted = false '
			+ ' GROUP BY name '
			+ ' ORDER BY count(*) DESC ';
			
	sails.log.debug('SQL：', sql);
	sails.log.info('計算中...');

	Pick.query(sql, function queryPick(err, results) {

		if (err) {
			sails.log.error(err);
			return;
		}
		sails.log.debug('計算結果：', results.rows);

		var maxResult = _.max(results.rows, function (row) {
			return parseInt(row.count, 10); 
		});
		var duplicateResults = _.where(results.rows, {count: maxResult.count});

		// 如果有兩個以上結果有相同票數，則重來
		if (duplicateResults.length > 1) {
			sails.log.info('重覆的選秀結果：', _.pluck(duplicateResults, 'name'));
			roundIterator.prev();
			
			Pick.revokePrevious({
				team : round.team.ename,
				round : round.round,
				draftNo : manager.initData.draft.no
			}, function afterRevokePreviousPick (revokeErr, results) {
				
				if (revokeErr) {
					sails.log.error(revokeErr);
					return;
				}

				sails.log.debug('撤銷前一次投單執行結果：', results);
				
				sails.sockets.blast('pick:duplicate', {names: _.pluck(duplicateResults, 'name')});
				setTimeout(function () {
					self.setMachineState(self.WAIT);
				}, 10000);
			});
			return;
		}
		
		maxResult = (maxResult === Number.NEGATIVE_INFINITY) ? { name: '未投單'} : maxResult;

		var result = {
			name : maxResult.name,
			count : maxResult.count || 0, // 有幾個人選
			team : round.team.ename,
			round : round.round,
			draftNo : manager.initData.draft.no
		};

		sails.log.debug('本輪選秀的最終結果', result);
		
		Result.create(result).exec(function createPickResult(createPickResultErr, createdResult) {
			if (createPickResultErr) {
				sails.log.error(createPickResultErr);
				return;
			}

			maxResult.count = round.count; //目前選秀到第幾個
			sails.log.info('picked', maxResult);

			roundIterator.giveUpIfNeccessary.call(roundIterator, maxResult);
			roundIterator.addPicked.call(roundIterator, maxResult);
			
			resultTable.addPicked.call(resultTable, {
				team : result.team, 
				round: result.round, 
				name: result.name
			});
	
			sails.sockets.blast('pick:result', {
				team : result.team, 
				round: result.round, 
				name: result.name,
				count : maxResult.count
			});
			self.setMachineState(self.BREAK);
		});
	});
};

/**
	decide should continue to next round or just end entire draft.
*/
manager.onBREAK = function (event, oldStage, newStage) {
	'use strict';

	sails.log.info('Take a break for ' + 10 + ' seconds.');
	var self = this;
	var nextStage = roundIterator.hasNext() ? this.WAIT : this.FINISHED;

	setTimeout(function () {
		self.setMachineState(nextStage);
	}, 10000);
};

manager.onFINISHED = function (event, oldStage, newStage) {
	'use strict';
	sails.log.info('本次選秀結束。');
	
	if (sails.config.environment == 'development') {
		var serverRestartSeconds = sails.config.draft.restartDraftSeconds; // 60
		var clientRestartSeconds = serverRestartSeconds * 1.5; // 90
		var self = this;
		
		sails.log.info('在 development mode');
		sails.log.info('下次選秀將在 ' + serverRestartSeconds + ' 秒鐘後開始');
		sails.log.info('使用者將在 ' + clientRestartSeconds + ' 秒鐘後重新整理\n\n');
		
		sails.sockets.blast('draft:restart', {
			countDownSeconds: clientRestartSeconds
		});
		
		setTimeout(function () {
			self.setMachineState(self.INIT);
		}, serverRestartSeconds * 1000);
	} else {
		sails.sockets.blast('draft:end');
	}
};

module.exports = manager;
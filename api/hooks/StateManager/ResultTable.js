/**
	用以快取目前的模擬選秀結果
*/
module.exports = (function () {
	'use strict';
	var table = {};

	return {
		init : function (options) {

			var teams = options.teams,
				possibleRounds = options.candidates.length + options.ignoreRounds.length,
				ignoreRounds = options.ignoreRounds;

			table.numOfRound = Math.ceil(possibleRounds / teams.length) + 1;

			// 為每個隊伍初始化輪次
			_.each(teams, function (team) {
				table[team.ename] = [table.numOfRound];
			});

			// 為被放棄的輪次初始化結果
			_.each(ignoreRounds, function (ignoreRound) {
				table[ignoreRound.team][ignoreRound.round] = '放棄';
			});
		},

		display : function () {
			return table;
		},

		addPicked : function (result) {
			table[result.team][result.round] = result.name;
		}
	};

}());
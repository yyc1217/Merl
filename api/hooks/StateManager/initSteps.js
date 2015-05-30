/* global PreSelectedCandidate */
/* global IgnoreRound */
/* global IgnoreCandidate */
/* global Result */
/* global Candidate */
/* global Draft */
/* global Pick */
/* global Team */
/* global sails */
/* global OfficialDraft */
/**
 * StateManager初始化要做的工作
 *
 * @see StateManager.js
 */
var initSteps = function() {
	
	// 紀錄錯誤
	var reportError = function (msg, err, cb) {
		sails.log.error(msg);
		sails.log.error(err);
		cb(err);
	};
	
	var steps = {
		
		/**
		 * 載入最新一次的官方選秀
		 */ 
		loadLatestOfficialDraft: function(cb) {
			OfficialDraft.findLatestOne(function(err, latestOfficialDraft) {
				if (err || !latestOfficialDraft) {
					reportError('無法找出最近一次的官方選秀 ', err, cb);
				} else {
					sails.log.info('載入最近一次的官方選秀：', latestOfficialDraft.hostDate);
					var results = {officialDraft: latestOfficialDraft};
					cb(null, results);
				}
			});
		},
		
		/**
		 * 載入參與選秀的隊伍
		 */ 
		loadTeams: function(results, cb) {
			Team.find({officialDraftNo: results.officialDraft.no})
			.sort('order')
			.exec(function(err, teams){
				if (err) {
					reportError('找不到任何隊伍，選秀資訊： ' + results.officialDraft, err, cb);
				} else {
					sails.log.info('依選秀順序載入參與選秀的隊伍：', _.pluck(teams, 'cname'));
					results.teams = teams;
					cb(null, results);
				}
			});
		},
		
		/**
		 * 載入最新一次的模擬選秀結果
		 */ 
		loadLatestDraftResult: function(results, cb) {
			
			Draft.findLatest(function(err, draft) {
				if (err) {
					reportError('無法載入最新一次的模擬選秀結果', err, cb);
					return;
				}
				
				// skip if no drafts exist
				if (draft == null) {
					sails.log.info('沒有最新一次的模擬選秀結果，官方選秀編號 #' + results.officialDraft.no);
					cb(null, results);
				} else {
					sails.log.info('最新的模擬選秀編號 #' + draft.no);
					results.latestDraft = draft;
					
					Result.find({draftNo: draft.no})
					.exec(function(err, picks) {
						if (err) {
							reportError('無法載入最新的模擬選秀結果', err, cb);
						} else {
							sails.log.info('載入最新的模擬選秀結果');
							
							var latestDraftResult = _.groupBy(picks, 'team');					
							_.each(latestDraftResult, function(picks, teamName) {
								latestDraftResult[teamName] = _.groupBy(picks, 'round');
							});
							sails.log.debug('最新的模擬選秀結果：', latestDraftResult);
							
							latestDraftResult.maxRound = _.max(picks, function(pick) { return pick.round;}).round || 0;
							results.latestDraftResult = latestDraftResult;
							
							cb(null, results);
						}
					});
				}
			});
		},
		
		/**
		 * 建立新的模擬選秀
		 */ 
		createDraft: function(results, cb) {
			Draft.createByOfficialDraft(results.officialDraft, function(err, draft) {
				if (err) {
					reportError('無法建立新的模擬選秀，CPBL官方選秀編號：' + results.officialDraft, err, cb);
				} else {				
					sails.log.info('建立新的模擬選秀 #' , draft.no, ', CPBL官方模擬選秀 #', draft.officialDraftNo);
					results.draft = draft;
					cb(null, results);
				}
			});
		},
		
		/**
		 * 載入候選人
		 */ 
		loadCandidates: function(results, cb) {
			Candidate.find({officialDraftNo: results.officialDraft.no}).exec(function (err, candidates) {
				if (err) {
					reportError('無法載入候選人', err, cb);
				} else {							
					sails.log.info('共有', candidates.length, '個候選人');
					sails.log.info(_.pluck(candidates, 'name'));
					results.candidates = candidates;
					cb(null, results);
				}
			});
		},
		
		/**
		 * 載入放棄的輪次
		 */ 
		loadIgnoreRounds: function(results, cb) {
			IgnoreRound.find({officialDraftNo: results.officialDraft.no}).exec(function(err, rounds) {
				if (err) {
					reportError('無法載入放棄的輪次', err, cb);
				} else {
					sails.log.info('放棄的輪次：', _.map(rounds, function(round){ return {team: round.team, round:round.round};}));
					results.ignoreRounds = rounds;
					cb(null, results);
				}
			});
		},

		/**
		 * 載入某隊不能選擇的候選人
		 */ 
		loadIgnoreCandidates: function(results, cb) {
			IgnoreCandidate.find({officialDraftNo: results.officialDraft.no})
			.exec(function(err, candidates) {
				if (err) {
					reportError('無法載入不能選擇的候選人', err, cb);
				} else {			
					var candidateMap = _.groupBy(
							_.map(candidates, function(candidate) {
								return { 
									team: candidate.team,
									name: candidate.name,
									};
							})
						, 'name');
								
					sails.log.info('不能選擇的候選人：', candidateMap);
					results.ignoreCandidates = candidateMap;
					
					cb(null, results);
				}
			});
		},
		
		/**
		 * 載入已預先被選走的球員
		 */
		loadPreSelectedCandidates: function(results, cb) {
			PreSelectedCandidate.find({officialDraftNo: results.officialDraft.no})
			.exec(function (err, candidates) {
				if (err) {
					reportError('無法載入已預先被選走的球員', err, cb);
				} else {
					var candidateMap = _.groupBy(
							_.map(candidates, function(candidate) {
								return { 
									team: candidate.team,
									name: candidate.name,
									};
							})
						, 'name');
								
					sails.log.info('已預先被選走的球員：', candidateMap);
					results.preSelectedCandidates = candidateMap;
					
					cb(null, results);
				}
			});
		},
		
		/**
		 * 預先產生已確定的部份模擬選秀結果
		 */ 
		generatePreDraftResult: function(results, cb) {
			var rounds = results.ignoreRounds,
				candidates = _.keys(results.preSelectedCandidates),
				draftNo = results.draft.no;
				
			var giveupResult = _.map(rounds, function(round) {
				return {
					team: round.team,
					round: round.round,
					count: 0,
					name: '放棄',
					draftNo: draftNo,
				};
			});
			
			var candidateRound = 0; 
			var choosenResult = _.map(candidates, function(candidate) {
				candidateRound += 1;
				return {
					team: candidate.team,
					round: candidateRound,
					count: 0,
					name: candidate.name,
					draftNo: draftNo,
				};
			});

			var totalPreVoteResult = giveupResult.concat(choosenResult);

			Result.create(totalPreVoteResult)
			.exec(function (err, createdResult) {
				if (err) {
					reportError('無法預先產生已確定的模擬選秀結果', err, cb);
				} else {
					sails.log.info('預先產生已確定的模擬選秀結果', createdResult);
					cb(null, results);
				}
			});
		},

		standBy: function(results, cb) {
			sails.log.info('所有初始化完成，請等待系統啟動完成');
			cb(null, results);
		},
		
	};
	
	return _.values(steps);
};
	
module.exports = initSteps;
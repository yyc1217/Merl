/* global Manager */
/*
 * TeamManagerRelation.js
 *
 *	在session中插入使用者代表的隊伍
 *  - 模擬選秀一旦開始，就不可更換隊伍
 *  - 若之前已選過，則本次可繼續代表該隊伍
 *  - 每次模擬選秀可代表不同隊伍
 */
module.exports = function (sails) {

	return {
		routes: {
			before: {
				'GET /': function loadTeamManager(req, res, next) {
					sails.log.debug('載入 使用者/隊伍 關係');
					sails.log.debug('req.user', req.user ? req.user.uid : ' undefined');
					sails.log.debug('req.session.teamBelongsTo', req.session.teamBelongsTo);

					// 未登入
					if (req.user === undefined) {
						sails.log.debug('未登入，跳過此步驟');
						req.session.notChoseATeamYet = null;
						next();
						return;
					}

					// 已選擇隊伍
					if (req.session.teamBelongsTo !== undefined) {
						sails.log.debug('已選擇隊伍，跳過此步驟');
						req.session.notChoseATeamYet = null;
						next();
						return;
					}

					Manager.findOne({
						uid : req.user.uid,
					}).sort('no DESC')
					.exec(function findManager (err, manager){
						if (err) {
							sails.log.error(err);
							next();
							return;
						}

						sails.log.debug('載入 manager', manager);

						if (manager) {
							sails.log.debug('載入使用者 ', manager.uid, ', 選擇隊伍', manager.team);
							req.session.teamBelongsTo = manager.team;
							req.session.notChoseATeamYet = null;
							next();
						} else {
							sails.log.debug('使用者 ', req.user.uid, ' 從未選擇過隊伍');
							req.session.notChoseATeamYet = true;
							next();
						}
					});
				},
			}
		},

		initialize: function (cb){
			return cb();
		}
	};
};
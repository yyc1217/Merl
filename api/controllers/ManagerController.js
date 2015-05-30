/* global Manager */
/* global sails */
/**
 * ManagerController
 *
 * @description :: 選擇代表隊伍
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */


/*
 選秀進行中
*/
function isDrafting(req) {
	return req.state === 'WAIT' || req.state === 'CALCULATE' || req.state === 'BREAK';
}

module.exports = {

	/*
		選擇代表隊伍的頁面
	*/
	index : function (req, res) {
		// 若是選秀已開始，並且已選擇代表隊伍，則不允許更動代表隊伍
		if (isDrafting(req)) { // 選秀已開始
			if (!req.session.notChoseATeamYet) { // 已選擇代表隊伍
				return res.redirect('/');
			}
		}
		return res.view({
			teams : req.teams
		});
	},
	 
	/*
		按下某個隊伍的按鈕
	*/
	submit : function (req, res) {
		'user strict';

		sails.log.debug('使用者選擇隊伍');
		
		// 未登入
		if (!req.user) {
			sails.log.debug('使用者未登入，導向首頁');
			return res.redirect('/login');
		}
		
		if (isDrafting(req)) {
			sails.log.debug('選秀中，導向首頁，目前系統狀態：', req.state);
			return res.redirect('/');
		}
		
		var teamName = req.param('team'),
			user = req.user;

		// 沒有這個隊伍
		if (_.pluck(req.teams, 'ename').indexOf(teamName) < 0) {
			sails.log.warn('可能是不懷好意的行為，嘗試選擇一個不存在的隊伍！', teamName);
			return res.redirect('/');
		}
		
		sails.log.debug('建立 使用者/隊伍 關係, 使用者', user.uid, ', 隊伍', teamName);
		var data = {
			uid : user.uid,
			team : teamName
		};
		
		Manager.create(data)
		.exec(function createManager (createErr, newManager) {
			if (createErr) {
				sails.log.error(createErr);
				res.view('500');
				return;
			}
			sails.log.debug('使用者/隊伍 關係已建立');
			req.session.teamBelongsTo = newManager.team;
			res.set('Location', '../');
			res.send(302);
		});
	}
 };
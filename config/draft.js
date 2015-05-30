/* global sais */
/* global sails */
/**
 * 選秀相關的參數
 *
 */
module.exports.draft = {

	/**
	 * 模擬選秀開始的時間點
	 */  
	startDraftTime: (function () {
		var draftTime;
		return function (options) {
			if (!draftTime || options && options.refresh) {
				draftTime = sails.config.startDraftTime();
			}
			return draftTime;
		};

	})(),

	/**
	 * 每個輪次等待的秒數
	 */ 
    waitPickSeconds: 30,
	
	/**
	 * 下次模擬選秀，server重新開始的秒數
	 */ 
	restartDraftSeconds: 60,
};
/**
 * a hook of StateManager
 *
 * @description :: hook of StateManager
 */

module.exports = function (sails) {

	var stateManager;

	/**
		目前選秀的階段
	*/
	var state = function () {
		return stateManager.getMachineState();
	};

	return {

		routes: {
			
			// request進來後，被controller處理前
			before: {
				'/manager': function (req, res, next) {
					req.state = state();
					req.teams = stateManager.hookParams().teams;
					next();
				},
				'GET /*': function bindStateManager(req, res, next) {
					_.extend(req, stateManager.hookParams());
					next();
				}
			}
		},

		initialize: function (cb){
			sails.log.info('Hook StageManager');
			stateManager =  require('./StateManager.js').next();
			return cb();
		}
	};
};
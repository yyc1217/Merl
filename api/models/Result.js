/**
* Result.js
*
* @description :: 模擬選秀的結果
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		no: {
			type : 'integer',
			primaryKey: true,
			autoIncrement: true
		},

		/* 模擬選秀的id */
		draftNo: {
			type : 'integer',
			required : true,
			columnName : 'draft_no'
		},

		/* 輪次 */
		round : 'integer',

		/* 隊伍 */
		team : 'string',

		/* 幾個人選 */
		amount: 'integer',

		/* 被選的人 */
		name : 'string'
	},
	
	/**
		補遺
	*/
	findLatestByMissing : function(missing, cb) {
		Result
		.find(missing)
		.limit(1)
		.sort('no DESC')
		.exec(function(err, result){
			cb(err, result);
		});
	}
};


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
		count: 'integer',

		/* 被選的人 */
		name : 'string'
	}
};


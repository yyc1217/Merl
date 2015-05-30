/**
* Pick.js
*
* @description :: 使用者在每個輪次的指名
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

		/* 候選人名稱 */
		name : 'string',

		/* 使用者id */
		uid : 'string'
	}
};

